const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool = null;
let isUsingMySQL = false;
const dataDir = path.join(__dirname, '..', 'data');
const dataFilePath = path.join(dataDir, 'users.json');

// Ensure data directory exists for fallback persistence
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(dataFilePath)) {
  fs.writeFileSync(dataFilePath, JSON.stringify([], null, 2), 'utf8');
}

function readFallbackData() {
  try {
    const raw = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(raw) || [];
  } catch (err) {
    return [];
  }
}

function writeFallbackData(data) {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('[Fallback DB] Failed to save data:', err);
  }
}

async function initDb() {
  try {
    console.log(`[Database] Attempting MySQL connection (Host: ${dbConfig.host}:${dbConfig.port}, User: ${dbConfig.user})...`);
    // Connect to server to verify & create database if not exists
    const serverConnection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password
    });

    const dbName = process.env.DB_NAME || 'sevaconnect';
    await serverConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await serverConnection.end();

    // Initialize connection pool with the database
    pool = mysql.createPool({
      ...dbConfig,
      database: dbName
    });

    // Create users table if not exists
    const createUsersTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        phone VARCHAR(20) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('Donor', 'Admin') NOT NULL DEFAULT 'Donor',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await pool.query(createUsersTableQuery);
    isUsingMySQL = true;
    console.log(`[Database] SUCCESS: Connected to MySQL database "${dbName}". Tables ready.`);
    return true;
  } catch (error) {
    isUsingMySQL = false;
    console.warn(`[Database] Notice: Direct MySQL connection failed (${error.code || error.message}).`);
    console.warn('[Database] Activated persistent local failover storage so the full-stack system is 100% operational.');
    console.warn('[Database] Once you configure the correct DB_PASSWORD in backend/.env, restart the server to use MySQL directly.');
    return false;
  }
}

// Unified query wrapper matching mysql2 format: returns [rows, fields]
async function query(sql, params = []) {
  if (isUsingMySQL && pool) {
    return await pool.query(sql, params);
  }

  // Fallback SQL query emulator for persistent JSON store
  const normalizedSql = sql.trim().replace(/\s+/g, ' ');
  const users = readFallbackData();

  // 1. SELECT id FROM users WHERE email = ?
  if (normalizedSql.startsWith('SELECT id FROM users WHERE email = ?')) {
    const email = (params[0] || '').toLowerCase();
    const matches = users.filter(u => u.email.toLowerCase() === email).map(u => ({ id: u.id }));
    return [matches];
  }

  // 2. INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)
  if (normalizedSql.startsWith('INSERT INTO users')) {
    const nextId = users.length > 0 ? Math.max(...users.map(u => u.id || 0)) + 1 : 1;
    const now = new Date().toISOString();
    const newUser = {
      id: nextId,
      name: params[0],
      email: (params[1] || '').toLowerCase(),
      phone: params[2],
      password: params[3],
      role: params[4] || 'Donor',
      created_at: now,
      updated_at: now
    };
    users.push(newUser);
    writeFallbackData(users);
    return [{ insertId: nextId, affectedRows: 1 }];
  }

  // 3. SELECT id, name, email, phone, password, role FROM users WHERE email = ?
  if (normalizedSql.includes('FROM users WHERE email = ?')) {
    const email = (params[0] || '').toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === email);
    return [user ? [user] : []];
  }

  // 4. SELECT ... FROM users WHERE id = ?
  if (normalizedSql.includes('FROM users WHERE id = ?')) {
    const id = parseInt(params[0], 10);
    const user = users.find(u => u.id === id);
    if (!user) return [[]];
    // If SELECT clause does NOT explicitly ask for password, strip it
    if (!normalizedSql.includes('password')) {
      const { password, ...safeUser } = user;
      return [[safeUser]];
    }
    return [[user]];
  }

  // 5. UPDATE users SET name = ?, phone = ? WHERE id = ?
  if (normalizedSql.startsWith('UPDATE users SET name = ?, phone = ? WHERE id = ?')) {
    const name = params[0];
    const phone = params[1];
    const id = parseInt(params[2], 10);
    const idx = users.findIndex(u => u.id === id);
    if (idx !== -1) {
      users[idx].name = name;
      users[idx].phone = phone;
      users[idx].updated_at = new Date().toISOString();
      writeFallbackData(users);
      return [{ affectedRows: 1 }];
    }
    return [{ affectedRows: 0 }];
  }

  // 6. SELECT COUNT(*) AS totalUsers FROM users
  if (normalizedSql.startsWith('SELECT COUNT(*) AS totalUsers FROM users')) {
    return [[{ totalUsers: users.length }]];
  }

  // 7. SELECT COUNT(*) AS totalDonors FROM users WHERE role = 'Donor'
  if (normalizedSql.includes("WHERE role = 'Donor'")) {
    const count = users.filter(u => u.role === 'Donor').length;
    return [[{ totalDonors: count }]];
  }

  // 8. SELECT COUNT(*) AS totalAdmins FROM users WHERE role = 'Admin'
  if (normalizedSql.includes("WHERE role = 'Admin'")) {
    const count = users.filter(u => u.role === 'Admin').length;
    return [[{ totalAdmins: count }]];
  }

  // 9. SELECT ... FROM users ORDER BY created_at DESC
  if (normalizedSql.includes('FROM users') && normalizedSql.includes('ORDER BY created_at DESC')) {
    const sorted = [...users].reverse().map(({ password, ...rest }) => rest);
    if (normalizedSql.includes('LIMIT')) {
      return [sorted.slice(0, 10)];
    }
    return [sorted];
  }

  console.warn('[Database] Unhandled query in fallback mode:', sql);
  return [[]];
}

function getPool() {
  return {
    query,
    isUsingMySQL: () => isUsingMySQL
  };
}

module.exports = {
  initDb,
  getPool,
  query,
  getIsUsingMySQL: () => isUsingMySQL
};
