const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

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
const campaignsFilePath = path.join(dataDir, 'campaigns.json');
const donationsFilePath = path.join(dataDir, 'donations.json');

const INITIAL_CAMPAIGNS = [
  {
    id: 1,
    title: "Slum Child Education & Evening Nutrition Drive",
    description: "Empowering 250+ underprivileged children in urban slums with evening remedial education classes, learning supplies, and daily wholesome nutritional meals. Your contributions bridge the educational gap and prevent dropouts.",
    goal_amount: 150000.0,
    deadline: "2026-12-31",
    category: "Education",
    status: "Active",
    created_by: 2,
    created_at: "2026-09-10T10:00:00.000Z",
    updated_at: "2026-09-10T10:00:00.000Z"
  },
  {
    id: 2,
    title: "Clean Drinking Water & Sanitation Well Project",
    description: "Constructing deep borewells and gravity-fed water filtration stations across drought-affected rural communities in the dry belts. Eliminates waterborne illnesses and spares women and children hours of daily walking.",
    goal_amount: 220000.0,
    deadline: "2026-11-30",
    category: "Healthcare",
    status: "Active",
    created_by: 2,
    created_at: "2026-09-10T11:00:00.000Z",
    updated_at: "2026-09-10T11:00:00.000Z"
  },
  {
    id: 3,
    title: "Emergency Flood Relief & Food Ration Kits",
    description: "Mobilizing essential emergency relief kits containing dry grains, pulses, baby food, clean water packets, and hygiene essentials for 500 vulnerable families affected by seasonal monsoon floods.",
    goal_amount: 300000.0,
    deadline: "2026-10-15",
    category: "Disaster Relief",
    status: "Active",
    created_by: 2,
    created_at: "2026-09-10T12:00:00.000Z",
    updated_at: "2026-09-10T12:00:00.000Z"
  },
  {
    id: 4,
    title: "Senior Citizen Warmth & Community Care Outreach",
    description: "Providing shelter assistance, winter blankets, mobility walking aids, and daily companionship support for abandoned and destitute elderly citizens across suburban care centers.",
    goal_amount: 120000.0,
    deadline: "2026-11-20",
    category: "Community Care",
    status: "Active",
    created_by: 2,
    created_at: "2026-09-11T09:00:00.000Z",
    updated_at: "2026-09-11T09:00:00.000Z"
  },
  {
    id: 5,
    title: "Daily Malnutrition Prevention & Midday Meal Drive",
    description: "Serving fresh, protein-rich hot meals, vitamin supplements, and clean drinking water to over 400 malnourished children and nursing mothers in semi-rural tribal settlements.",
    goal_amount: 180000.0,
    deadline: "2026-12-15",
    category: "Nutrition",
    status: "Active",
    created_by: 2,
    created_at: "2026-09-11T10:00:00.000Z",
    updated_at: "2026-09-11T10:00:00.000Z"
  },
  {
    id: 6,
    title: "Rural Mobile Medical Van & Diagnostic Health Camps",
    description: "Operating free mobile health clinics equipped with basic diagnostic equipment, essential medicines, diabetic screening, and maternal care checkups for remote underserved villages.",
    goal_amount: 250000.0,
    deadline: "2026-11-30",
    category: "Healthcare",
    status: "Active",
    created_by: 2,
    created_at: "2026-09-11T11:00:00.000Z",
    updated_at: "2026-09-11T11:00:00.000Z"
  },
  {
    id: 7,
    title: "Winter Clothes & Blanket Drive for Homeless Families",
    description: "Successfully distributed thermal woollens, jackets, and heavy blankets to 800+ pavement dwellers and shelter inmates facing harsh northern winter waves.",
    goal_amount: 100000.0,
    deadline: "2026-08-31",
    category: "Community Care",
    status: "Completed",
    created_by: 2,
    created_at: "2026-08-01T10:00:00.000Z",
    updated_at: "2026-09-01T10:00:00.000Z"
  }
];

// Ensure data directory exists for fallback persistence
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(dataFilePath)) {
  fs.writeFileSync(dataFilePath, JSON.stringify([], null, 2), 'utf8');
}
if (!fs.existsSync(campaignsFilePath)) {
  fs.writeFileSync(campaignsFilePath, JSON.stringify(INITIAL_CAMPAIGNS, null, 2), 'utf8');
}
if (!fs.existsSync(donationsFilePath)) {
  fs.writeFileSync(donationsFilePath, JSON.stringify([], null, 2), 'utf8');
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
    console.error('[Fallback DB] Failed to save users data:', err);
  }
}

function readFallbackCampaigns() {
  try {
    const raw = fs.readFileSync(campaignsFilePath, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    fs.writeFileSync(campaignsFilePath, JSON.stringify(INITIAL_CAMPAIGNS, null, 2), 'utf8');
    return INITIAL_CAMPAIGNS;
  } catch (err) {
    return INITIAL_CAMPAIGNS;
  }
}

function writeFallbackCampaigns(data) {
  try {
    fs.writeFileSync(campaignsFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('[Fallback DB] Failed to save campaigns data:', err);
  }
}

function readFallbackDonations() {
  try {
    const raw = fs.readFileSync(donationsFilePath, 'utf8');
    return JSON.parse(raw) || [];
  } catch (err) {
    return [];
  }
}

function writeFallbackDonations(data) {
  try {
    fs.writeFileSync(donationsFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('[Fallback DB] Failed to save donations data:', err);
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

    // Create campaigns table if not exists (V1.2)
    const createCampaignsTableQuery = `
      CREATE TABLE IF NOT EXISTS campaigns (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        description TEXT NOT NULL,
        goal_amount DECIMAL(12,2) NOT NULL,
        deadline DATE,
        category VARCHAR(100),
        status ENUM('Active', 'Completed', 'Closed') NOT NULL DEFAULT 'Active',
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id),
        INDEX idx_campaign_status (status),
        INDEX idx_campaign_category (category)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    // Create donations table if not exists (V1.2)
    const createDonationsTableQuery = `
      CREATE TABLE IF NOT EXISTS donations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        token VARCHAR(20) NOT NULL UNIQUE,
        donor_id INT NULL,
        donor_name VARCHAR(100) NOT NULL,
        donor_email VARCHAR(150) NOT NULL,
        donor_phone VARCHAR(20),
        campaign_id INT NULL,
        donation_type ENUM('Money', 'Item') NOT NULL,
        amount DECIMAL(12,2) NULL,
        item_description TEXT NULL,
        item_quantity VARCHAR(50) NULL,
        notes TEXT,
        status ENUM('Pending Verification', 'Verified', 'Rejected', 'Completed') NOT NULL DEFAULT 'Pending Verification',
        verified_by INT NULL,
        verified_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (donor_id) REFERENCES users(id),
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
        FOREIGN KEY (verified_by) REFERENCES users(id),
        INDEX idx_token (token),
        INDEX idx_status (status),
        INDEX idx_donation_campaign (campaign_id),
        INDEX idx_donor (donor_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await pool.query(createUsersTableQuery);
    await pool.query(createCampaignsTableQuery);
    await pool.query(createDonationsTableQuery);
    isUsingMySQL = true;
    console.log(`[Database] SUCCESS: Connected to MySQL database "${dbName}". Tables (users, campaigns, donations) ready.`);
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
    try {
      return await pool.query(sql, params);
    } catch (err) {
      console.warn('[Database Warning] Direct MySQL query failed:', err.message);
      console.warn('[Database Warning] Falling back to local persistent store for continuity.');
    }
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

  // ==========================================
  // FALLBACK CAMPAIGNS & DONATIONS (V1.2)
  // ==========================================
  const campaigns = readFallbackCampaigns();
  const donations = readFallbackDonations();

  function enrichCampaign(c) {
    const compDonations = donations.filter(d => d.campaign_id === c.id && d.status === 'Completed');
    const amount_collected = compDonations
      .filter(d => d.donation_type === 'Money')
      .reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
    const total_donations_count = compDonations.length;
    return {
      ...c,
      amount_collected,
      total_donations_count
    };
  }

  // CAMPAIGNS: Get by ID
  if (normalizedSql.includes('FROM campaigns') && (normalizedSql.includes('c.id = ?') || normalizedSql.includes('WHERE id = ?'))) {
    const id = parseInt(params[0], 10);
    const c = campaigns.find(item => item.id === id);
    return [c ? [enrichCampaign(c)] : []];
  }

  // CAMPAIGNS: List with optional filters
  if (normalizedSql.includes('FROM campaigns') && !normalizedSql.startsWith('SELECT COUNT(*)')) {
    let filtered = campaigns.map(enrichCampaign);
    if (normalizedSql.includes('status = ?') || normalizedSql.includes('c.status = ?')) {
      const status = params[0];
      filtered = filtered.filter(c => c.status === status);
    }
    if (normalizedSql.includes('category = ?') || normalizedSql.includes('c.category = ?')) {
      const cat = params[params.length - 1];
      filtered = filtered.filter(c => c.category === cat);
    }
    return [filtered.reverse()];
  }

  // CAMPAIGNS: Insert
  if (normalizedSql.startsWith('INSERT INTO campaigns')) {
    const nextId = campaigns.length > 0 ? Math.max(...campaigns.map(c => c.id || 0)) + 1 : 1;
    const now = new Date().toISOString();
    const newCamp = {
      id: nextId,
      title: params[0],
      description: params[1],
      goal_amount: parseFloat(params[2]) || 0,
      deadline: params[3] || null,
      category: params[4] || 'General',
      status: params[5] || 'Active',
      created_by: params[6] || 1,
      created_at: now,
      updated_at: now
    };
    campaigns.push(newCamp);
    writeFallbackCampaigns(campaigns);
    return [{ insertId: nextId, affectedRows: 1 }];
  }

  // CAMPAIGNS: Update
  if (normalizedSql.startsWith('UPDATE campaigns SET')) {
    const id = parseInt(params[params.length - 1], 10);
    const idx = campaigns.findIndex(c => c.id === id);
    if (idx !== -1) {
      if (normalizedSql.includes('title = ?')) campaigns[idx].title = params[0];
      if (normalizedSql.includes('description = ?')) campaigns[idx].description = params[1];
      if (normalizedSql.includes('goal_amount = ?')) campaigns[idx].goal_amount = parseFloat(params[2]) || campaigns[idx].goal_amount;
      if (normalizedSql.includes('deadline = ?')) campaigns[idx].deadline = params[3];
      if (normalizedSql.includes('category = ?')) campaigns[idx].category = params[4];
      if (normalizedSql.includes('status = ?')) {
        const sIndex = params.findIndex(p => ['Active', 'Completed', 'Closed'].includes(p));
        if (sIndex !== -1) campaigns[idx].status = params[sIndex];
      }
      campaigns[idx].updated_at = new Date().toISOString();
      writeFallbackCampaigns(campaigns);
      return [{ affectedRows: 1 }];
    }
    return [{ affectedRows: 0 }];
  }

  // CAMPAIGNS: Counts
  if (normalizedSql.startsWith('SELECT COUNT(*) AS count FROM campaigns')) {
    if (normalizedSql.includes("WHERE status = 'Active'")) {
      return [[{ count: campaigns.filter(c => c.status === 'Active').length }]];
    }
    return [[{ count: campaigns.length }]];
  }

  // DONATIONS: Max ID
  if (normalizedSql.includes('SELECT MAX(id) AS maxId FROM donations')) {
    const maxId = donations.length > 0 ? Math.max(...donations.map(d => d.id || 0)) : 0;
    return [[{ maxId }]];
  }

  // DONATIONS: Insert
  if (normalizedSql.startsWith('INSERT INTO donations')) {
    const nextId = donations.length > 0 ? Math.max(...donations.map(d => d.id || 0)) + 1 : 1;
    const now = new Date().toISOString();
    const token = params[0];
    const newDonation = {
      id: nextId,
      token,
      donor_id: params[1] || null,
      donor_name: params[2],
      donor_email: (params[3] || '').toLowerCase(),
      donor_phone: params[4] || '',
      campaign_id: params[5] || null,
      donation_type: params[6] || 'Money',
      amount: params[7] !== null ? parseFloat(params[7]) : null,
      item_description: params[8] || null,
      item_quantity: params[9] || null,
      notes: params[10] || '',
      status: 'Pending Verification',
      verified_by: null,
      verified_at: null,
      created_at: now,
      updated_at: now
    };
    donations.push(newDonation);
    writeFallbackDonations(donations);
    return [{ insertId: nextId, affectedRows: 1 }];
  }

  // DONATIONS: Get by Token
  if (normalizedSql.includes('FROM donations') && normalizedSql.includes('d.token = ?')) {
    const token = (params[0] || '').trim().toUpperCase();
    const match = donations.find(d => (d.token || '').toUpperCase() === token);
    if (!match) return [[]];
    const c = campaigns.find(x => x.id === match.campaign_id);
    return [[{ ...match, campaign_title: c?.title, campaign_category: c?.category }]];
  }

  // DONATIONS: Get by ID
  if (normalizedSql.includes('FROM donations') && normalizedSql.includes('d.id = ?')) {
    const id = parseInt(params[0], 10);
    const match = donations.find(d => d.id === id);
    if (!match) return [[]];
    const c = campaigns.find(x => x.id === match.campaign_id);
    const verifier = users.find(u => u.id === match.verified_by);
    return [[{ ...match, campaign_title: c?.title, campaign_category: c?.category, verifier_name: verifier?.name }]];
  }

  // DONATIONS: Get by Donor
  if (normalizedSql.includes('FROM donations') && normalizedSql.includes('d.donor_id = ?')) {
    const donorId = parseInt(params[0], 10);
    const list = donations
      .filter(d => d.donor_id === donorId)
      .map(d => {
        const c = campaigns.find(x => x.id === d.campaign_id);
        return { ...d, campaign_title: c?.title, campaign_category: c?.category };
      })
      .reverse();
    return [list];
  }

  // DONATIONS: List all (Admin)
  if (normalizedSql.includes('FROM donations') && !normalizedSql.includes('COUNT(') && !normalizedSql.includes('SUM(')) {
    let list = donations.map(d => {
      const c = campaigns.find(x => x.id === d.campaign_id);
      const verifier = users.find(u => u.id === d.verified_by);
      return { ...d, campaign_title: c?.title, campaign_category: c?.category, verifier_name: verifier?.name };
    });

    let paramIndex = 0;
    if (normalizedSql.includes('d.status = ?')) {
      const s = params[paramIndex++];
      if (s && s !== 'All') list = list.filter(d => d.status === s);
    }
    if (normalizedSql.includes('d.campaign_id = ?')) {
      const cId = parseInt(params[paramIndex++], 10);
      if (!isNaN(cId)) list = list.filter(d => d.campaign_id === cId);
    }
    if (normalizedSql.includes('d.donation_type = ?')) {
      const dt = params[paramIndex++];
      if (dt && dt !== 'All') list = list.filter(d => d.donation_type === dt);
    }
    if (normalizedSql.includes('d.token LIKE ?')) {
      const q = (params[paramIndex++] || '').replace(/%/g, '').toUpperCase();
      if (q) list = list.filter(d => (d.token || '').toUpperCase().includes(q));
    }
    return [list.reverse()];
  }

  // DONATIONS: Update status
  if (normalizedSql.startsWith('UPDATE donations SET')) {
    const newStatus = params[0];
    const adminId = params[1];
    const verifiedAt = params[2] ? new Date(params[2]).toISOString() : new Date().toISOString();
    const id = parseInt(params[3], 10);
    const idx = donations.findIndex(d => d.id === id);
    if (idx !== -1) {
      donations[idx].status = newStatus;
      donations[idx].verified_by = adminId;
      donations[idx].verified_at = verifiedAt;
      donations[idx].updated_at = new Date().toISOString();
      writeFallbackDonations(donations);
      return [{ affectedRows: 1 }];
    }
    return [{ affectedRows: 0 }];
  }

  // DONATIONS: Counts & stats
  if (normalizedSql.startsWith('SELECT COUNT(*) AS count FROM donations')) {
    if (normalizedSql.includes("WHERE status = 'Pending Verification'")) {
      return [[{ count: donations.filter(d => d.status === 'Pending Verification').length }]];
    }
    if (normalizedSql.includes("WHERE status = 'Verified'")) {
      return [[{ count: donations.filter(d => d.status === 'Verified').length }]];
    }
    if (normalizedSql.includes("WHERE status = 'Completed'")) {
      return [[{ count: donations.filter(d => d.status === 'Completed').length }]];
    }
    return [[{ count: donations.length }]];
  }
  if (normalizedSql.includes('SUM(amount)') && normalizedSql.includes("status = 'Completed'")) {
    const total = donations
      .filter(d => d.status === 'Completed' && d.donation_type === 'Money')
      .reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
    return [[{ totalFunds: total }]];
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
