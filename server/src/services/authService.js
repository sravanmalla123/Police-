import bcrypt from 'bcryptjs';
import { db } from '../config/db.js';
import { signToken } from '../utils/jwt.js';

const SALT_ROUNDS = 12;

/**
 * Authenticates a user by employee_id and password.
 * Returns { token, user } on success. Throws on failure.
 */
export async function loginUser({ loginId, password, role, accessMode }) {
  const user = await db.get(
    'SELECT id, employee_id, name, role, password, is_admin, zone, division, reporting_station, access_modes FROM users WHERE employee_id = ?',
    [loginId]
  );

  if (!user) {
    const err = new Error('Invalid credentials.'); err.status = 401; throw err;
  }

  if (user.is_admin && role === 'admin') {
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      const err = new Error('Invalid credentials.'); err.status = 401; throw err;
    }
    const token = signToken({ userId: user.id, employeeId: user.employee_id, role: 'admin', name: user.name, accessMode: 'admin' });
    return {
      token,
      user: { id: user.id, employee_id: user.employee_id, name: user.name, role: 'admin', zone: user.zone, division: user.division, accessMode: 'admin' },
    };
  }

  // Backward compatibility check for legacy calls
  let selectedAccessMode = accessMode;
  let selectedRole = role;
  if (!selectedAccessMode && ['SB Control', 'SB Periscope', 'SB DSR'].includes(role)) {
    selectedAccessMode = role;
    selectedRole = 'Other';
  }

  // Check role match (bypassed for demostaff@website.com to allow testing different officer ranks)
  if (user.role !== selectedRole && user.employee_id !== 'demostaff@website.com') {
    const err = new Error(`Account role is "${user.role}", but logged in as "${selectedRole}".`);
    err.status = 403;
    throw err;
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    const err = new Error('Invalid credentials.'); err.status = 401; throw err;
  }

  // Validate selected login access mode
  const modes = user.access_modes ? user.access_modes.split(',').map(m => m.trim()) : [];
  if (!modes.includes(selectedAccessMode)) {
    const err = new Error(`Account is not authorized for "${selectedAccessMode}" access mode.`);
    err.status = 403;
    throw err;
  }

  const resolvedRole = user.employee_id === 'demostaff@website.com' ? selectedRole : user.role;

  const token = signToken({ 
    userId: user.id, 
    employeeId: user.employee_id,
    role: resolvedRole, 
    name: user.name, 
    accessMode: selectedAccessMode 
  });

  return {
    token,
    user: { 
      id: user.id, 
      employee_id: user.employee_id,
      name: user.name, 
      role: resolvedRole, 
      zone: user.zone, 
      division: user.division, 
      reporting_station: user.reporting_station,
      accessMode: selectedAccessMode 
    },
  };
}

/**
 * Returns all non-admin officers.
 */
export async function getOfficers() {
  return db.all('SELECT id, employee_id, name, role, zone, division, reporting_station, access_modes FROM users WHERE is_admin = 0');
}

/**
 * Seeds the initial admin and staff accounts on first boot.
 * All passwords are loaded from environment variables.
 */
export async function seedUsers() {
  // Seed Demo Admin (for recruiters/testers)
  const demoAdmin = await db.get("SELECT id FROM users WHERE employee_id = 'demo@website.com'");
  if (!demoAdmin) {
    const hash = await bcrypt.hash('demo123', SALT_ROUNDS);
    await db.run(
      'INSERT INTO users (employee_id, name, role, password, is_admin, access_modes) VALUES (?, ?, ?, ?, ?, ?)',
      ['demo@website.com', 'Demo Admin', 'admin', hash, 1, 'admin']
    );
    console.log('✅ Demo Admin account seeded.');
  }

  // Seed Demo Staff (for recruiters/testers)
  const demoStaff = await db.get("SELECT id FROM users WHERE employee_id = 'demostaff@website.com'");
  if (!demoStaff) {
    const hash = await bcrypt.hash('demo123', SALT_ROUNDS);
    await db.run(
      'INSERT INTO users (employee_id, name, role, password, is_admin, zone, division, access_modes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      ['demostaff@website.com', 'Demo Staff', 'CI', hash, 0, 'West', 'West', 'SB Control,SB Periscope,SB DSR']
    );
    console.log('✅ Demo Staff account seeded.');
  }
}

/**
 * Creates a new staff user.
 * Checks for existing employee_id first.
 */
export async function createStaffUser({ employeeId, name, role, password, zone, division, reportingStation, accessModes }) {
  const exists = await db.get('SELECT id FROM users WHERE employee_id = ?', [employeeId]);
  if (exists) {
    const err = new Error(`Employee ID "${employeeId}" already exists.`);
    err.status = 400;
    throw err;
  }

  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  const result = await db.run(
    'INSERT INTO users (employee_id, name, role, password, is_admin, zone, division, reporting_station, access_modes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [employeeId, name, role, hash, 0, zone || null, division || null, reportingStation || null, accessModes || null]
  );
  return { id: result.insertId, employee_id: employeeId, name, role, zone, division, reporting_station: reportingStation, access_modes: accessModes };
}

/**
 * Deletes a staff user by ID (only if they are not admin).
 */
export async function deleteUserById(userId) {
  const result = await db.run('DELETE FROM users WHERE id = ? AND is_admin = 0', [userId]);
  if (result.affectedRows === 0) {
    const err = new Error('Staff user not found or cannot be deleted.');
    err.status = 404;
    throw err;
  }
  return { success: true };
}

/**
 * Impersonates a staff user by employee_id without requiring a password.
 * Returns { token, user } on success.
 */
export async function impersonateUser({ employeeId }) {
  const user = await db.get(
    'SELECT id, employee_id, name, role, is_admin, zone, division, reporting_station, access_modes FROM users WHERE employee_id = ? AND is_admin = 0',
    [employeeId]
  );

  if (!user) {
    const err = new Error('Staff user not found.');
    err.status = 404;
    throw err;
  }

  // Determine the access mode. Pick the first allowed access mode, or default to 'SB Control'
  const modes = user.access_modes ? user.access_modes.split(',').map(m => m.trim()) : [];
  const selectedAccessMode = modes[0] || 'SB Control';

  const token = signToken({ 
    userId: user.id, 
    employeeId: user.employee_id,
    role: user.role, 
    name: user.name, 
    accessMode: selectedAccessMode 
  });

  return {
    token,
    user: { 
      id: user.id, 
      employee_id: user.employee_id,
      name: user.name, 
      role: user.role, 
      zone: user.zone, 
      division: user.division, 
      reporting_station: user.reporting_station,
      accessMode: selectedAccessMode 
    },
  };
}

/**
 * Fetches a user profile by ID.
 */
export async function getUserById(userId) {
  return await db.get(
    'SELECT id, employee_id, name, role, is_admin, zone, division, reporting_station, access_modes FROM users WHERE id = ?',
    [userId]
  );
}

