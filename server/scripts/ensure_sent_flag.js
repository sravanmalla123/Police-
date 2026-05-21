import sqlite3 from 'sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let dbFile = path.resolve(__dirname, '../data/app.db');

try {
  const dbDir = path.dirname(dbFile);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  const testFile = path.join(dbDir, '.write_test');
  fs.writeFileSync(testFile, 'test');
  fs.unlinkSync(testFile);
} catch (err) {
  dbFile = '/tmp/app.db';
  try {
    const dbDir = path.dirname(dbFile);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    const testFile = path.join(dbDir, '.write_test');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
  } catch (err2) {
    dbFile = ':memory:';
  }
}

const sqlite = sqlite3.verbose();
const db = new sqlite.Database(dbFile);
db.on('error', (err) => {
  console.error('Migration DB connection error:', err);
});

db.serialize(() => {
  db.all(`PRAGMA table_info(reports);`, (err, rows) => {
    if (err) {
      console.error('PRAGMA error', err);
      db.close();
      process.exit(1);
    }
    const exists = rows.some(r => r.name === 'sent_to_commissioner');
    if (!exists) {
      db.run(`ALTER TABLE reports ADD COLUMN sent_to_commissioner INTEGER NOT NULL DEFAULT 1;`, function (e) {
        if (e) console.error('ALTER error', e);
        else console.log('sent_to_commissioner column added');
        db.close();
      });
    } else {
      // Ensure existing rows have non-null value (set to 1)
      db.run(`UPDATE reports SET sent_to_commissioner = 1 WHERE sent_to_commissioner IS NULL;`, function (e) {
        if (e) console.error('UPDATE error', e);
        else console.log('sent_to_commissioner column exists; ensured non-null values');
        db.close();
      });
    }
  });
});
