import express from 'express';
import { all, get, run } from '../db.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { verifyToken } from '../auth.js';

const router = express.Router();

const translationCache = new Map();

async function translateText(text, targetLang) {
  if (!targetLang || targetLang === 'original') return text;
  
  const cacheKey = `${text}_${targetLang}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  let translatedText = `[${targetLang}] ` + text;
  const apiUrl = process.env.TRANSLATE_API_URL;
  if (apiUrl) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000);
    try {
      const resp = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ q: text, source: 'auto', target: targetLang, format: 'text' }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (resp.ok) {
        const json = await resp.json();
        if (json && json.translatedText) {
          translatedText = json.translatedText;
          translationCache.set(cacheKey, translatedText);
          return translatedText;
        }
        if (json && json.result) {
          translatedText = json.result;
          translationCache.set(cacheKey, translatedText);
          return translatedText;
        }
      }
    } catch (err) {
      clearTimeout(timeoutId);
    }
  }

  // Fallback: Google Translate Free Web API (client=gtx)
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const resp = await fetch(url);
    if (resp.ok) {
      const json = await resp.json();
      if (json && json[0] && json[0][0] && json[0][0][0]) {
        translatedText = json[0][0][0];
        translationCache.set(cacheKey, translatedText);
        return translatedText;
      }
    }
  } catch (err) {
    // ignore and drop through
  }

  translationCache.set(cacheKey, translatedText);
  return translatedText;
}

// Translate a single report with its translations dict and optionally specific translated_description in parallel
async function populateReportTranslations(report, lang) {
  if (!report) return;
  report.translations = {};

  if (lang && lang !== 'original') {
    try {
      const res = await translateText(report.description, lang);
      report.translated_description = res;
      report.translations[lang] = res;
    } catch (err) {
      report.translated_description = `[${lang}] ` + report.description;
      report.translations[lang] = `[${lang}] ` + report.description;
    }
  } else {
    report.translated_description = report.description;
  }
}

// Populate all report translations in parallel
async function populateAllReportsTranslations(reports, lang) {
  const promises = reports.map(report => populateReportTranslations(report, lang));
  await Promise.all(promises);
}

// Simple in-memory SSE clients list
const sseClients = new Set();

function sendSseEvent(eventName, data) {
  const payload = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of sseClients) {
    try {
      res.write(payload);
    } catch (e) {
      // ignore
    }
  }
}

router.get('/my', authMiddleware, async (req, res) => {
  try {
    const rows = await all(`SELECT * FROM reports WHERE user_id = ? ORDER BY created_at DESC`, [req.user.userId]);
    const { lang } = req.query;
    await populateAllReportsTranslations(rows, lang);
    return res.json({ reports: rows });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load your reports.' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role === 'admin') {
    return res.status(403).json({ message: 'Admin users cannot submit staff reports.' });
  }

  const { area, station, officerName, priority, description, latitude, longitude } = req.body;
  if (!area || !station || !officerName || !priority || !description) {
    return res.status(400).json({ message: 'All report fields are required.' });
  }

  try {
    await run(
      `INSERT INTO reports (user_id, area, station, officer_name, priority, description, status, sent_to_commissioner, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, 'pending', 1, ?, ?);`,
      [req.user.userId, area, station, officerName, priority, description, latitude || null, longitude || null]
    );
    // load the inserted report (latest)
    const latest = await all(`SELECT * FROM reports WHERE user_id = ? ORDER BY id DESC LIMIT 1`, [req.user.userId]);
    const report = latest && latest[0] ? latest[0] : null;
    if (report) {
      // prepare translations in parallel
      await populateReportTranslations(report, null);
      // notify SSE clients
      sendSseEvent('new_report', report);
    }
    return res.status(201).json({ message: 'Report submitted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to submit your report.' });
  }
});

router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  const { area, station, priority, status, sortBy } = req.query;
  const { lang } = req.query;
  const conditions = [];
  const values = [];

  if (area) {
    conditions.push('area LIKE ?');
    values.push(`%${area}%`);
  }
  if (station) {
    conditions.push('station LIKE ?');
    values.push(`%${station}%`);
  }
  if (priority && priority !== 'All') {
    conditions.push('priority = ?');
    values.push(priority);
  }
  if (status && status !== 'All') {
    conditions.push('status = ?');
    values.push(status);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')} AND sent_to_commissioner = 1` : 'WHERE sent_to_commissioner = 1';
  let order = 'ORDER BY created_at DESC';
  if (sortBy === 'Oldest') order = 'ORDER BY created_at ASC';
  if (sortBy === 'Priority') order = "ORDER BY CASE priority WHEN 'High' THEN 1 WHEN 'Medium' THEN 2 WHEN 'Low' THEN 3 END ASC";

  try {
    const rows = await all(`SELECT * FROM reports ${whereClause} ${order}`, values);
    await populateAllReportsTranslations(rows, lang);
    return res.json({ reports: rows });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load reports.' });
  }
});

// SSE endpoint for admin to receive new reports in real-time
router.get('/stream', async (req, res) => {
  // Accept token via query for EventSource (demo only)
  const token = req.query.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).end();
  try {
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).end();
  } catch (err) {
    return res.status(401).end();
  }

  res.writeHead(200, {
    Connection: 'keep-alive',
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache'
  });
  res.write('\n');
  sseClients.add(res);
  req.on('close', () => {
    sseClients.delete(res);
  });
});

router.patch('/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  if (!['pending', 'in_review', 'resolved'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status.' });
  }

  try {
    const row = await get(`SELECT id FROM reports WHERE id = ?`, [id]);
    if (!row) {
      return res.status(404).json({ message: 'Report not found.' });
    }

    await run(`UPDATE reports SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [status, id]);
    
    const updated = await get(`SELECT * FROM reports WHERE id = ?`, [id]);
    if (updated) {
      await populateReportTranslations(updated, null);
      sendSseEvent('report_updated', updated);
    }

    return res.json({ message: 'Report status updated.', report: updated });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to update report status.' });
  }
});

// Route to assign on-duty officer
router.patch('/:id/assign', authMiddleware, adminMiddleware, async (req, res) => {
  const { assignedOfficer } = req.body;
  const { id } = req.params;
  try {
    const row = await get(`SELECT id FROM reports WHERE id = ?`, [id]);
    if (!row) {
      return res.status(404).json({ message: 'Report not found.' });
    }
    await run(`UPDATE reports SET assigned_officer = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [assignedOfficer || null, id]);
    
    const updated = await get(`SELECT * FROM reports WHERE id = ?`, [id]);
    if (updated) {
      await populateReportTranslations(updated, null);
      sendSseEvent('report_updated', updated);
    }
    return res.json({ message: 'Officer assigned successfully.', report: updated });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to assign officer.' });
  }
});

// Route to broadcast emergency bulletins
router.post('/bulletins', authMiddleware, adminMiddleware, async (req, res) => {
  const { message, severity } = req.body;
  if (!message || !severity) {
    return res.status(400).json({ message: 'Message and severity are required.' });
  }
  try {
    await run(`INSERT INTO bulletins (message, severity) VALUES (?, ?);`, [message, severity]);
    const latest = await get(`SELECT * FROM bulletins ORDER BY id DESC LIMIT 1`);
    sendSseEvent('new_bulletin', latest);
    return res.status(201).json({ message: 'Bulletin broadcasted successfully.', bulletin: latest });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to broadcast bulletin.' });
  }
});

// Route to retrieve bulletins
router.get('/bulletins', authMiddleware, async (req, res) => {
  try {
    const rows = await all(`SELECT * FROM bulletins ORDER BY id DESC LIMIT 15`);
    return res.json({ bulletins: rows });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load bulletins.' });
  }
});

export default router;
