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
const volunteersFilePath = path.join(dataDir, 'volunteers.json');
const beneficiariesFilePath = path.join(dataDir, 'beneficiaries.json');
const assistanceRequestsFilePath = path.join(dataDir, 'assistance_requests.json');
const inventoryItemsFilePath = path.join(dataDir, 'inventory_items.json');
const inventoryHistoryFilePath = path.join(dataDir, 'inventory_history.json');
const resourceAllocationsFilePath = path.join(dataDir, 'resource_allocations.json');
const notificationsFilePath = path.join(dataDir, 'notifications.json');
const feedbackFilePath = path.join(dataDir, 'feedback.json');
const donationStatusHistoryFilePath = path.join(dataDir, 'donation_status_history.json');
const chatbotLogsFilePath = path.join(dataDir, 'chatbot_logs.json');
const volunteerPointsFilePath = path.join(dataDir, 'volunteer_points.json');
const pointTransactionsFilePath = path.join(dataDir, 'point_transactions.json');
const badgesFilePath = path.join(dataDir, 'badges.json');
const userBadgesFilePath = path.join(dataDir, 'user_badges.json');
const notificationPreferencesFilePath = path.join(dataDir, 'notification_preferences.json');
const adminAuditLogFilePath = path.join(dataDir, 'admin_audit_log.json');

const INITIAL_BADGES = [
  { id: 1, name: 'First Steps', description: 'Completed your first community assistance delivery task.', icon: 'award' },
  { id: 2, name: 'Dedicated Helper', description: 'Successfully fulfilled 5 relief distribution tasks.', icon: 'shield-check' },
  { id: 3, name: 'Community Champion', description: 'Completed 10 or more community relief delivery tasks.', icon: 'trophy' },
  { id: 4, name: 'Priority Hero', description: 'Completed 3 or more High-priority emergency relief missions.', icon: 'flame' },
  { id: 5, name: 'Centurion', description: 'Earned over 250 volunteer service points.', icon: 'zap' },
  { id: 6, name: 'Legendary Volunteer', description: 'Reached over 500 volunteer service points.', icon: 'crown' }
];

const INITIAL_CAMPAIGNS = [
  {
    id: 1,
    title: "Slum Child Education & Evening Nutrition Drive",
    description: "Empowering 250+ underprivileged children in urban slums with evening remedial education classes, learning supplies, and daily wholesome nutritional meals. Your contributions bridge the educational gap and prevent dropouts.",
    goal_amount: 150000.0,
    start_date: "2026-08-01",
    deadline: "2026-12-31",
    category: "Education",
    status: "Active",
    image_url: "/assets/campaigns/education.jpg",
    created_by: 2,
    created_at: "2026-08-01T10:00:00.000Z",
    updated_at: "2026-08-01T10:00:00.000Z"
  },
  {
    id: 2,
    title: "Clean Drinking Water & Sanitation Well Project",
    description: "Constructing deep borewells and gravity-fed water filtration stations across drought-affected rural communities in the dry belts. Eliminates waterborne illnesses and spares women and children hours of daily walking.",
    goal_amount: 220000.0,
    start_date: "2026-08-05",
    deadline: "2026-11-30",
    category: "Healthcare",
    status: "Active",
    image_url: "/assets/campaigns/water.jpg",
    created_by: 2,
    created_at: "2026-08-05T11:00:00.000Z",
    updated_at: "2026-08-05T11:00:00.000Z"
  },
  {
    id: 3,
    title: "Emergency Flood Relief & Food Ration Kits",
    description: "Mobilizing essential emergency relief kits containing dry grains, pulses, baby food, clean water packets, and hygiene essentials for 500 vulnerable families affected by seasonal monsoon floods.",
    goal_amount: 300000.0,
    start_date: "2026-08-10",
    deadline: "2026-10-15",
    category: "Disaster Relief",
    status: "Active",
    image_url: "/assets/campaigns/flood_relief.jpg",
    created_by: 2,
    created_at: "2026-08-10T12:00:00.000Z",
    updated_at: "2026-08-10T12:00:00.000Z"
  },
  {
    id: 4,
    title: "Senior Citizen Warmth & Community Care Outreach",
    description: "Providing shelter assistance, winter blankets, mobility walking aids, and daily companionship support for abandoned and destitute elderly citizens across suburban care centers.",
    goal_amount: 120000.0,
    start_date: "2026-08-12",
    deadline: "2026-11-20",
    category: "Community Care",
    status: "Active",
    image_url: "/assets/campaigns/elderly.jpg",
    created_by: 2,
    created_at: "2026-08-12T09:00:00.000Z",
    updated_at: "2026-08-12T09:00:00.000Z"
  },
  {
    id: 5,
    title: "Daily Malnutrition Prevention & Midday Meal Drive",
    description: "Serving fresh, protein-rich hot meals, vitamin supplements, and clean drinking water to over 400 malnourished children and nursing mothers in semi-rural tribal settlements.",
    goal_amount: 180000.0,
    start_date: "2026-08-15",
    deadline: "2026-12-15",
    category: "Nutrition",
    status: "Active",
    image_url: "/assets/campaigns/nutrition.jpg",
    created_by: 2,
    created_at: "2026-08-15T10:00:00.000Z",
    updated_at: "2026-08-15T10:00:00.000Z"
  },
  {
    id: 6,
    title: "Rural Mobile Medical Van & Diagnostic Health Camps",
    description: "Operating free mobile health clinics equipped with basic diagnostic equipment, essential medicines, diabetic screening, and maternal care checkups for remote underserved villages.",
    goal_amount: 250000.0,
    start_date: "2026-08-18",
    deadline: "2026-11-30",
    category: "Healthcare",
    status: "Active",
    image_url: "/assets/campaigns/medical.jpg",
    created_by: 2,
    created_at: "2026-08-18T11:00:00.000Z",
    updated_at: "2026-08-18T11:00:00.000Z"
  },
  {
    id: 7,
    title: "Winter Clothes & Blanket Drive for Homeless Families",
    description: "Successfully distributed thermal woollens, jackets, and heavy blankets to 800+ pavement dwellers and shelter inmates facing harsh northern winter waves.",
    goal_amount: 100000.0,
    start_date: "2026-08-01",
    deadline: "2026-08-31",
    category: "Community Care",
    status: "Completed",
    image_url: "/assets/campaigns/winter.jpg",
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
if (!fs.existsSync(volunteersFilePath)) {
  fs.writeFileSync(volunteersFilePath, JSON.stringify([], null, 2), 'utf8');
}
if (!fs.existsSync(beneficiariesFilePath)) {
  fs.writeFileSync(beneficiariesFilePath, JSON.stringify([], null, 2), 'utf8');
}
if (!fs.existsSync(assistanceRequestsFilePath)) {
  fs.writeFileSync(assistanceRequestsFilePath, JSON.stringify([], null, 2), 'utf8');
}
if (!fs.existsSync(inventoryItemsFilePath)) {
  fs.writeFileSync(inventoryItemsFilePath, JSON.stringify([], null, 2), 'utf8');
}
if (!fs.existsSync(inventoryHistoryFilePath)) {
  fs.writeFileSync(inventoryHistoryFilePath, JSON.stringify([], null, 2), 'utf8');
}
if (!fs.existsSync(resourceAllocationsFilePath)) {
  fs.writeFileSync(resourceAllocationsFilePath, JSON.stringify([], null, 2), 'utf8');
}
if (!fs.existsSync(notificationsFilePath)) {
  fs.writeFileSync(notificationsFilePath, JSON.stringify([], null, 2), 'utf8');
}
if (!fs.existsSync(feedbackFilePath)) {
  fs.writeFileSync(feedbackFilePath, JSON.stringify([], null, 2), 'utf8');
}
if (!fs.existsSync(donationStatusHistoryFilePath)) {
  fs.writeFileSync(donationStatusHistoryFilePath, JSON.stringify([], null, 2), 'utf8');
}
if (!fs.existsSync(chatbotLogsFilePath)) {
  fs.writeFileSync(chatbotLogsFilePath, JSON.stringify([], null, 2), 'utf8');
}
if (!fs.existsSync(volunteerPointsFilePath)) {
  fs.writeFileSync(volunteerPointsFilePath, JSON.stringify([], null, 2), 'utf8');
}
if (!fs.existsSync(pointTransactionsFilePath)) {
  fs.writeFileSync(pointTransactionsFilePath, JSON.stringify([], null, 2), 'utf8');
}
if (!fs.existsSync(badgesFilePath)) {
  fs.writeFileSync(badgesFilePath, JSON.stringify(INITIAL_BADGES, null, 2), 'utf8');
}
if (!fs.existsSync(userBadgesFilePath)) {
  fs.writeFileSync(userBadgesFilePath, JSON.stringify([], null, 2), 'utf8');
}
if (!fs.existsSync(notificationPreferencesFilePath)) {
  fs.writeFileSync(notificationPreferencesFilePath, JSON.stringify([], null, 2), 'utf8');
}
if (!fs.existsSync(adminAuditLogFilePath)) {
  fs.writeFileSync(adminAuditLogFilePath, JSON.stringify([], null, 2), 'utf8');
}


function readFallbackData() {
  try {
    const raw = fs.readFileSync(dataFilePath, 'utf8');
    const parsed = JSON.parse(raw) || [];
    return parsed.map(u => ({
      ...u,
      is_active: u.is_active !== undefined ? Boolean(u.is_active) : true
    }));
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
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((c, i) => ({
        ...c,
        start_date: c.start_date || (INITIAL_CAMPAIGNS[i] ? INITIAL_CAMPAIGNS[i].start_date : '2026-08-01')
      }));
    }
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

function readFallbackVolunteers() {
  try {
    const raw = fs.readFileSync(volunteersFilePath, 'utf8');
    return JSON.parse(raw) || [];
  } catch (err) {
    return [];
  }
}

function writeFallbackVolunteers(data) {
  try {
    fs.writeFileSync(volunteersFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('[Fallback DB] Failed to save volunteers data:', err);
  }
}

function readFallbackBeneficiaries() {
  try {
    const raw = fs.readFileSync(beneficiariesFilePath, 'utf8');
    return JSON.parse(raw) || [];
  } catch (err) {
    return [];
  }
}

function writeFallbackBeneficiaries(data) {
  try {
    fs.writeFileSync(beneficiariesFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('[Fallback DB] Failed to save beneficiaries data:', err);
  }
}

function readFallbackAssistanceRequests() {
  try {
    const raw = fs.readFileSync(assistanceRequestsFilePath, 'utf8');
    return JSON.parse(raw) || [];
  } catch (err) {
    return [];
  }
}

function writeFallbackAssistanceRequests(data) {
  try {
    fs.writeFileSync(assistanceRequestsFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('[Fallback DB] Failed to save assistance requests data:', err);
  }
}

function readFallbackInventoryItems() {
  try {
    const raw = fs.readFileSync(inventoryItemsFilePath, 'utf8');
    return JSON.parse(raw) || [];
  } catch (err) {
    return [];
  }
}

function writeFallbackInventoryItems(data) {
  try {
    fs.writeFileSync(inventoryItemsFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('[Fallback DB] Failed to save inventory items data:', err);
  }
}

function readFallbackInventoryHistory() {
  try {
    const raw = fs.readFileSync(inventoryHistoryFilePath, 'utf8');
    return JSON.parse(raw) || [];
  } catch (err) {
    return [];
  }
}

function writeFallbackInventoryHistory(data) {
  try {
    fs.writeFileSync(inventoryHistoryFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('[Fallback DB] Failed to save inventory history data:', err);
  }
}

function readFallbackResourceAllocations() {
  try {
    const raw = fs.readFileSync(resourceAllocationsFilePath, 'utf8');
    return JSON.parse(raw) || [];
  } catch (err) {
    return [];
  }
}

function writeFallbackResourceAllocations(data) {
  try {
    fs.writeFileSync(resourceAllocationsFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('[Fallback DB] Failed to save resource allocations data:', err);
  }
}

function readFallbackNotifications() {
  try {
    const raw = fs.readFileSync(notificationsFilePath, 'utf8');
    return JSON.parse(raw) || [];
  } catch (err) {
    return [];
  }
}

function writeFallbackNotifications(data) {
  try {
    fs.writeFileSync(notificationsFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('[Fallback DB] Failed to save notifications data:', err);
  }
}

function readFallbackFeedback() {
  try {
    const raw = fs.readFileSync(feedbackFilePath, 'utf8');
    return JSON.parse(raw) || [];
  } catch (err) {
    return [];
  }
}

function writeFallbackFeedback(data) {
  try {
    fs.writeFileSync(feedbackFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('[Fallback DB] Failed to save feedback data:', err);
  }
}

function readFallbackDonationStatusHistory() {
  try {
    const raw = fs.readFileSync(donationStatusHistoryFilePath, 'utf8');
    let history = JSON.parse(raw) || [];
    if (history.length === 0) {
      const donations = readFallbackDonations();
      let nextId = 1;
      donations.forEach(d => {
        history.push({
          id: nextId++,
          donation_id: d.id,
          status: 'Pending Verification',
          changed_by: null,
          created_at: d.created_at || '2026-08-01T10:00:00.000Z'
        });
        if (d.status === 'Verified' || d.status === 'Completed') {
          history.push({
            id: nextId++,
            donation_id: d.id,
            status: 'Verified',
            changed_by: d.verified_by || 2,
            created_at: d.verified_at || d.created_at || '2026-08-01T11:00:00.000Z'
          });
        }
        if (d.status === 'Rejected') {
          history.push({
            id: nextId++,
            donation_id: d.id,
            status: 'Rejected',
            changed_by: d.verified_by || 2,
            created_at: d.verified_at || d.updated_at || d.created_at || '2026-08-01T11:00:00.000Z'
          });
        }
        if (d.status === 'Completed') {
          history.push({
            id: nextId++,
            donation_id: d.id,
            status: 'Completed',
            changed_by: d.verified_by || 2,
            created_at: d.updated_at || d.verified_at || d.created_at || '2026-08-01T12:00:00.000Z'
          });
        }
      });
      writeFallbackDonationStatusHistory(history);
    }
    return history;
  } catch (err) {
    return [];
  }
}

function writeFallbackDonationStatusHistory(data) {
  try {
    fs.writeFileSync(donationStatusHistoryFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('[Fallback DB] Failed to save donation status history:', err);
  }
}

function readFallbackChatbotLogs() {
  try {
    const raw = fs.readFileSync(chatbotLogsFilePath, 'utf8');
    return JSON.parse(raw) || [];
  } catch (err) {
    return [];
  }
}

function writeFallbackChatbotLogs(data) {
  try {
    fs.writeFileSync(chatbotLogsFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('[Fallback DB] Failed to save chatbot logs:', err);
  }
}

function readFallbackVolunteerPoints() {
  try {
    const raw = fs.readFileSync(volunteerPointsFilePath, 'utf8');
    return JSON.parse(raw) || [];
  } catch (err) {
    return [];
  }
}

function writeFallbackVolunteerPoints(data) {
  try {
    fs.writeFileSync(volunteerPointsFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('[Fallback DB] Failed to save volunteer points:', err);
  }
}

function readFallbackPointTransactions() {
  try {
    const raw = fs.readFileSync(pointTransactionsFilePath, 'utf8');
    return JSON.parse(raw) || [];
  } catch (err) {
    return [];
  }
}

function writeFallbackPointTransactions(data) {
  try {
    fs.writeFileSync(pointTransactionsFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('[Fallback DB] Failed to save point transactions:', err);
  }
}

function readFallbackBadges() {
  try {
    if (!fs.existsSync(badgesFilePath)) {
      fs.writeFileSync(badgesFilePath, JSON.stringify(INITIAL_BADGES, null, 2), 'utf8');
      return INITIAL_BADGES;
    }
    const raw = fs.readFileSync(badgesFilePath, 'utf8');
    const list = JSON.parse(raw);
    return Array.isArray(list) && list.length > 0 ? list : INITIAL_BADGES;
  } catch (err) {
    return INITIAL_BADGES;
  }
}

function writeFallbackBadges(data) {
  try {
    fs.writeFileSync(badgesFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('[Fallback DB] Failed to save badges:', err);
  }
}

function readFallbackUserBadges() {
  try {
    const raw = fs.readFileSync(userBadgesFilePath, 'utf8');
    return JSON.parse(raw) || [];
  } catch (err) {
    return [];
  }
}

function writeFallbackUserBadges(data) {
  try {
    fs.writeFileSync(userBadgesFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('[Fallback DB] Failed to save user badges:', err);
  }
}

function readFallbackNotificationPreferences() {
  try {
    const raw = fs.readFileSync(notificationPreferencesFilePath, 'utf8');
    return JSON.parse(raw) || [];
  } catch (err) {
    return [];
  }
}

function writeFallbackNotificationPreferences(data) {
  try {
    fs.writeFileSync(notificationPreferencesFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('[Fallback DB] Failed to save notification preferences:', err);
  }
}

function readFallbackAdminAuditLog() {
  try {
    const raw = fs.readFileSync(adminAuditLogFilePath, 'utf8');
    return JSON.parse(raw) || [];
  } catch (err) {
    return [];
  }
}

function writeFallbackAdminAuditLog(data) {
  try {
    fs.writeFileSync(adminAuditLogFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('[Fallback DB] Failed to save admin audit log:', err);
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
        start_date DATE,
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
    try {
      await pool.query('ALTER TABLE campaigns ADD COLUMN start_date DATE AFTER goal_amount');
    } catch (colErr) {
      // Column may already exist, ignore error
    }
    await pool.query(createDonationsTableQuery);

    // Update users role to include Volunteer (V1.3)
    try {
      await pool.query("ALTER TABLE users MODIFY COLUMN role ENUM('Donor', 'Admin', 'Volunteer') NOT NULL DEFAULT 'Donor'");
    } catch (roleErr) {
      // Column may already have this type
    }

    // Create volunteer_profiles table if not exists (V1.3)
    const createVolunteerProfilesTableQuery = `
      CREATE TABLE IF NOT EXISTS volunteer_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        skills VARCHAR(255),
        availability VARCHAR(255),
        status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    // Create beneficiaries table if not exists (V1.3)
    const createBeneficiariesTableQuery = `
      CREATE TABLE IF NOT EXISTS beneficiaries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(150),
        address TEXT,
        category VARCHAR(100),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    // Create assistance_requests table if not exists (V1.3)
    const createAssistanceRequestsTableQuery = `
      CREATE TABLE IF NOT EXISTS assistance_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        beneficiary_id INT NOT NULL,
        category VARCHAR(100),
        description TEXT NOT NULL,
        quantity_needed VARCHAR(50),
        urgency ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
        status ENUM('Submitted', 'Under Review', 'Approved', 'Rejected', 'Resources Allocated', 'Volunteer Assigned', 'Completed') NOT NULL DEFAULT 'Submitted',
        reviewed_by INT NULL,
        assigned_volunteer_id INT NULL,
        admin_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(id),
        FOREIGN KEY (reviewed_by) REFERENCES users(id),
        FOREIGN KEY (assigned_volunteer_id) REFERENCES users(id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    // Create inventory_items table if not exists (V1.3)
    const createInventoryItemsTableQuery = `
      CREATE TABLE IF NOT EXISTS inventory_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        category VARCHAR(100),
        unit VARCHAR(30) NOT NULL,
        quantity_available DECIMAL(12,2) NOT NULL DEFAULT 0,
        quantity_distributed DECIMAL(12,2) NOT NULL DEFAULT 0,
        low_stock_threshold DECIMAL(12,2) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    // Create inventory_history table if not exists (V1.3)
    const createInventoryHistoryTableQuery = `
      CREATE TABLE IF NOT EXISTS inventory_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        inventory_item_id INT NOT NULL,
        change_type ENUM('Addition', 'Deduction') NOT NULL,
        quantity DECIMAL(12,2) NOT NULL,
        reason VARCHAR(255),
        reference_type VARCHAR(50),
        reference_id INT NULL,
        performed_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id),
        FOREIGN KEY (performed_by) REFERENCES users(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    // Create resource_allocations table if not exists (V1.3)
    const createResourceAllocationsTableQuery = `
      CREATE TABLE IF NOT EXISTS resource_allocations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        assistance_request_id INT NOT NULL,
        inventory_item_id INT NOT NULL,
        quantity DECIMAL(12,2) NOT NULL,
        allocated_by INT NOT NULL,
        distribution_status ENUM('Allocated', 'Delivered') NOT NULL DEFAULT 'Allocated',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (assistance_request_id) REFERENCES assistance_requests(id),
        FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id),
        FOREIGN KEY (allocated_by) REFERENCES users(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await pool.query(createVolunteerProfilesTableQuery);
    await pool.query(createBeneficiariesTableQuery);
    await pool.query(createAssistanceRequestsTableQuery);
    await pool.query(createInventoryItemsTableQuery);
    await pool.query(createInventoryHistoryTableQuery);
    await pool.query(createResourceAllocationsTableQuery);

    // Create notifications table if not exists (V2.1)
    const createNotificationsTableQuery = `
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        recipient_id INT NOT NULL,
        type VARCHAR(50) NOT NULL,
        message VARCHAR(255) NOT NULL,
        reference_type VARCHAR(50),
        reference_id INT NULL,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (recipient_id) REFERENCES users(id),
        INDEX idx_recipient_read (recipient_id, is_read)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await pool.query(createNotificationsTableQuery);

    // Add priority and deadline columns to assistance_requests if missing (V2.1)
    try {
      await pool.query("ALTER TABLE assistance_requests ADD COLUMN priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium' AFTER urgency");
    } catch (e) { /* column may already exist */ }
    try {
      await pool.query("ALTER TABLE assistance_requests ADD COLUMN deadline DATE NULL AFTER priority");
    } catch (e) { /* column may already exist */ }

    // Initial Seed Inventory
    await pool.query(`
      INSERT IGNORE INTO inventory_items (id, name, category, unit, quantity_available, quantity_distributed, low_stock_threshold) VALUES
      (1, 'Family Emergency Grain & Ration Kit (15kg)', 'Food & Nutrition', 'Kits', 120.00, 45.00, 30.00),
      (2, 'Thermal Winter Woollen Blankets', 'Winter Relief', 'Pieces', 85.00, 150.00, 25.00),
      (3, 'Community Medical First-Aid Kit', 'Medical & Health', 'Boxes', 40.00, 15.00, 15.00),
      (4, 'Sanitary Hygiene & Soap Packs', 'Hygiene & Water', 'Packs', 18.00, 95.00, 20.00),
      (5, 'Primary School Remedial Study Kit', 'Education', 'Sets', 60.00, 35.00, 15.00)
    `);

    // Create feedback table if not exists (V2.3)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS feedback (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        feedback_type ENUM('Donation', 'VolunteerTask', 'Campaign') NOT NULL,
        reference_id INT NOT NULL,
        rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE KEY unique_feedback_per_target (user_id, feedback_type, reference_id),
        INDEX idx_type_reference (feedback_type, reference_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Create donation_status_history table if not exists (V2.3)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS donation_status_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        donation_id INT NOT NULL,
        status ENUM('Pending Verification', 'Verified', 'Rejected', 'Completed') NOT NULL,
        changed_by INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (donation_id) REFERENCES donations(id),
        FOREIGN KEY (changed_by) REFERENCES users(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Create chatbot_logs table if not exists (V3.1)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chatbot_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        message TEXT NOT NULL,
        response TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // ==========================================================
    // V3.2 ADVANCED ENHANCEMENTS TABLES (MySQL)
    // ==========================================================
    // 1. Volunteer Points & Gamification
    await pool.query(`
      CREATE TABLE IF NOT EXISTS volunteer_points (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        total_points INT NOT NULL DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS point_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        points INT NOT NULL,
        reason VARCHAR(255) NOT NULL,
        reference_type VARCHAR(50),
        reference_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        INDEX idx_points_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Badges & Recognition
    await pool.query(`
      CREATE TABLE IF NOT EXISTS badges (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description VARCHAR(255) NOT NULL,
        icon VARCHAR(50)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_badges (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        badge_id INT NOT NULL,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (badge_id) REFERENCES badges(id),
        UNIQUE KEY unique_user_badge (user_id, badge_id),
        INDEX idx_badge_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Seed Badges in MySQL
    try {
      await pool.query(`
        INSERT IGNORE INTO badges (id, name, description, icon) VALUES
        (1, 'First Steps', 'Completed your first community assistance delivery task.', 'award'),
        (2, 'Dedicated Helper', 'Successfully fulfilled 5 relief distribution tasks.', 'shield-check'),
        (3, 'Community Champion', 'Completed 10 or more community relief delivery tasks.', 'trophy'),
        (4, 'Priority Hero', 'Completed 3 or more High-priority emergency relief missions.', 'flame'),
        (5, 'Centurion', 'Earned over 250 volunteer service points.', 'zap'),
        (6, 'Legendary Volunteer', 'Reached over 500 volunteer service points.', 'crown');
      `);
    } catch (e) { /* ignore if already seeded */ }

    // 3. Notification Preferences
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notification_preferences (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        notification_type VARCHAR(50) NOT NULL,
        enabled BOOLEAN NOT NULL DEFAULT TRUE,
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE KEY unique_user_pref (user_id, notification_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Admin Audit Log (Write-Only)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_audit_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        admin_id INT NOT NULL,
        action VARCHAR(100) NOT NULL,
        target_type VARCHAR(50),
        target_id INT NULL,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_id) REFERENCES users(id),
        INDEX idx_audit_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 5. Add is_active column to users if missing
    try {
      await pool.query("ALTER TABLE users ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE");
    } catch (e) { /* column may already exist */ }

    // Backfill donation_status_history in MySQL if empty
    try {
      await pool.query(`
        INSERT INTO donation_status_history (donation_id, status, changed_by, created_at)
        SELECT id, 'Pending Verification', NULL, created_at FROM donations
        WHERE NOT EXISTS (SELECT 1 FROM donation_status_history WHERE donation_status_history.donation_id = donations.id)
      `);
    } catch (e) { /* ignore if already seeded */ }

    isUsingMySQL = true;
    console.log(`[Database] SUCCESS: Connected to MySQL database "${dbName}". All V1.1–V3.2 tables ready.`);
    return true;
  } catch (error) {
    isUsingMySQL = false;
    console.warn(`[Database] Notice: Direct MySQL connection failed (${error.code || error.message}).`);
    console.warn('[Database] Activated persistent local failover storage so the full-stack system is 100% operational.');
    console.warn('[Database] Once you configure the correct DB_PASSWORD in backend/.env, restart the server to use MySQL directly.');
    return false;
  }
}

function getAugustTimestamp() {
  const d = new Date();
  const day = String(Math.min(Math.max(d.getDate(), 1), 31)).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  const secs = String(d.getSeconds()).padStart(2, '0');
  return `2026-08-${day}T${hours}:${mins}:${secs}.000Z`;
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
  const campaigns = readFallbackCampaigns();
  const donations = readFallbackDonations();
  const volunteers = readFallbackVolunteers();
  const beneficiaries = readFallbackBeneficiaries();
  const assistanceRequests = readFallbackAssistanceRequests();
  const inventoryItems = readFallbackInventoryItems();
  const inventoryHistory = readFallbackInventoryHistory();
  const resourceAllocations = readFallbackResourceAllocations();
  const notifications = readFallbackNotifications();
  const feedback = readFallbackFeedback();
  const donationStatusHistory = readFallbackDonationStatusHistory();

  // 1. SELECT id FROM users WHERE email = ?
  if (normalizedSql.startsWith('SELECT id FROM users WHERE email = ?')) {
    const email = (params[0] || '').toLowerCase();
    const matches = users.filter(u => u.email.toLowerCase() === email).map(u => ({ id: u.id }));
    return [matches];
  }

  // 2. INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)
  if (normalizedSql.startsWith('INSERT INTO users')) {
    const nextId = users.length > 0 ? Math.max(...users.map(u => u.id || 0)) + 1 : 1;
    const now = getAugustTimestamp();
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
      users[idx].updated_at = getAugustTimestamp();
      writeFallbackData(users);
      return [{ affectedRows: 1, matchedRows: 1 }];
    }
    return [{ affectedRows: 0, matchedRows: 0 }];
  }

  // 5b. UPDATE users SET password = ? WHERE email = ? (DEF-04)
  if (normalizedSql.startsWith('UPDATE users SET password = ? WHERE email = ?')) {
    const newHashedPassword = params[0];
    const email = (params[1] || '').toLowerCase();
    const idx = users.findIndex(u => u.email.toLowerCase() === email);
    if (idx !== -1) {
      users[idx].password = newHashedPassword;
      users[idx].updated_at = getAugustTimestamp();
      writeFallbackData(users);
      return [{ affectedRows: 1, matchedRows: 1 }];
    }
    return [{ affectedRows: 0, matchedRows: 0 }];
  }

  // 5c. DELETE FROM users WHERE id = ? (DEF-07)
  if (normalizedSql.startsWith('DELETE FROM users WHERE id = ?')) {
    const id = parseInt(params[0], 10);
    const initialCount = users.length;
    const remainingUsers = users.filter(u => u.id !== id);
    if (remainingUsers.length !== initialCount) {
      writeFallbackData(remainingUsers);
      return [{ affectedRows: 1 }];
    }
    return [{ affectedRows: 0 }];
  }

  // 6. SELECT COUNT(*) AS totalUsers FROM users
  if (normalizedSql.startsWith('SELECT COUNT(*) AS totalUsers FROM users')) {
    return [[{ totalUsers: users.length }]];
  }

  // 7. SELECT COUNT(*) AS totalDonors FROM users WHERE role = 'Donor'
  if (normalizedSql.includes('AS totalDonors') || (normalizedSql.startsWith('SELECT COUNT(*)') && normalizedSql.includes("role = 'Donor'"))) {
    const count = users.filter(u => u.role === 'Donor').length;
    return [[{ totalDonors: count }]];
  }

  // 8. SELECT COUNT(*) AS totalAdmins FROM users WHERE role = 'Admin'
  if (normalizedSql.includes('AS totalAdmins') || (normalizedSql.startsWith('SELECT COUNT(*)') && normalizedSql.includes("role = 'Admin'"))) {
    const count = users.filter(u => u.role === 'Admin').length;
    return [[{ totalAdmins: count }]];
  }

  // 8b. SELECT id FROM users WHERE role = 'Admin' / SELECT ... FROM users WHERE role = 'Admin'
  if (normalizedSql.includes("WHERE role = 'Admin'") || normalizedSql.includes("WHERE u.role = 'Admin'")) {
    const adminList = users.filter(u => u.role === 'Admin').map(({ password, ...rest }) => rest);
    return [adminList];
  }

  // 9. SELECT ... FROM users ORDER BY created_at DESC
  if (normalizedSql.includes('FROM users') && normalizedSql.includes('ORDER BY created_at DESC') && !normalizedSql.includes('LEFT JOIN donations') && !normalizedSql.includes('donations_count')) {
    const sorted = [...users].reverse().map(({ password, ...rest }) => rest);
    if (normalizedSql.includes('LIMIT')) {
      return [sorted.slice(0, 10)];
    }
    return [sorted];
  }

  // ==========================================
  // FALLBACK CAMPAIGNS & DONATIONS (V1.2)
  // ==========================================
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
      if (status && status !== 'All') {
        filtered = filtered.filter(c => c.status === status);
      }
    }
    if (normalizedSql.includes('category = ?') || normalizedSql.includes('c.category = ?')) {
      const cat = params[params.length - 1];
      if (cat && cat !== 'All') {
        filtered = filtered.filter(c => c.category === cat);
      }
    }
    if (normalizedSql.includes('c.title) like ?') || normalizedSql.includes('description) like ?')) {
      const searchParam = params.find(p => typeof p === 'string' && p.startsWith('%') && p.endsWith('%'));
      if (searchParam) {
        const s = searchParam.slice(1, -1).toLowerCase();
        filtered = filtered.filter(c => 
          (c.title && c.title.toLowerCase().includes(s)) ||
          (c.description && c.description.toLowerCase().includes(s)) ||
          (c.category && c.category.toLowerCase().includes(s))
        );
      }
    }
    return [filtered.reverse()];
  }

  // CAMPAIGNS: Insert
  if (normalizedSql.startsWith('INSERT INTO campaigns')) {
    const nextId = campaigns.length > 0 ? Math.max(...campaigns.map(c => c.id || 0)) + 1 : 1;
    const now = new Date().toISOString();
    let title, description, goal_amount, start_date, deadline, category, status, created_by;
    if (normalizedSql.includes('start_date')) {
      [title, description, goal_amount, start_date, deadline, category, status, created_by] = params;
    } else {
      [title, description, goal_amount, deadline, category, status, created_by] = params;
      start_date = '2026-08-01';
    }
    const newCamp = {
      id: nextId,
      title,
      description,
      goal_amount: parseFloat(goal_amount) || 0,
      start_date: start_date || '2026-08-01',
      deadline: deadline || null,
      category: category || 'General',
      status: status || 'Active',
      created_by: created_by || 1,
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
      const setMatch = normalizedSql.match(/SET\s+(.+?)\s+WHERE/i);
      if (setMatch) {
        const fieldAssignments = setMatch[1].split(',').map(s => s.trim());
        fieldAssignments.forEach((assignment, i) => {
          const field = assignment.split('=')[0].trim();
          let val = params[i];
          if (field === 'goal_amount') val = parseFloat(val) || 0;
          campaigns[idx][field] = val;
        });
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
    const now = '2026-08-15T10:30:00.000Z';
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
    const id = parseInt(params[3], 10);
    const idx = donations.findIndex(d => d.id === id);
    if (idx !== -1) {
      let verifiedAt = params[2] ? new Date(params[2]).toISOString() : new Date().toISOString();
      if (donations[idx].created_at && donations[idx].created_at.includes('2026-08')) {
        const cDate = new Date(donations[idx].created_at);
        cDate.setHours(cDate.getHours() + 2);
        verifiedAt = cDate.toISOString();
      }
      donations[idx].status = newStatus;
      donations[idx].verified_by = adminId;
      donations[idx].verified_at = verifiedAt;
      donations[idx].updated_at = verifiedAt;
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

  // ==========================================================
  // V1.3 VOLUNTEERS FALLBACK HANDLERS
  // ==========================================================

  // Volunteer: Get profile by user_id
  if (normalizedSql.includes('FROM volunteer_profiles') && normalizedSql.includes('user_id = ?')) {
    const uId = parseInt(params[0], 10);
    const vp = volunteers.find(v => v.user_id === uId);
    const u = users.find(x => x.id === uId);
    if (!vp && !u) return [[]];
    return [[{
      ...(vp || { id: null, user_id: uId, skills: '', availability: '', status: 'Active' }),
      name: u?.name || '',
      email: u?.email || '',
      phone: u?.phone || ''
    }]];
  }

  // Volunteer: Insert profile
  if (normalizedSql.startsWith('INSERT INTO volunteer_profiles')) {
    const nextId = volunteers.length > 0 ? Math.max(...volunteers.map(v => v.id || 0)) + 1 : 1;
    const now = getAugustTimestamp();
    const newVp = {
      id: nextId,
      user_id: parseInt(params[0], 10),
      skills: params[1] || '',
      availability: params[2] || '',
      status: params[3] || 'Active',
      created_at: now
    };
    volunteers.push(newVp);
    writeFallbackVolunteers(volunteers);
    return [{ insertId: nextId, affectedRows: 1 }];
  }

  // Volunteer: Update profile
  if (normalizedSql.startsWith('UPDATE volunteer_profiles SET')) {
    const skills = params[0];
    const availability = params[1];
    const status = params[2];
    const uId = parseInt(params[3], 10);
    const idx = volunteers.findIndex(v => v.user_id === uId);
    if (idx !== -1) {
      volunteers[idx].skills = skills;
      volunteers[idx].availability = availability;
      volunteers[idx].status = status || volunteers[idx].status;
      writeFallbackVolunteers(volunteers);
      return [{ affectedRows: 1 }];
    } else {
      const nextId = volunteers.length > 0 ? Math.max(...volunteers.map(v => v.id || 0)) + 1 : 1;
      volunteers.push({
        id: nextId,
        user_id: uId,
        skills,
        availability,
        status: status || 'Active',
        created_at: getAugustTimestamp()
      });
      writeFallbackVolunteers(volunteers);
      return [{ affectedRows: 1, insertId: nextId }];
    }
  }

  // Volunteer: List all volunteers (Admin)
  if (normalizedSql.includes("WHERE u.role = 'Volunteer'") || normalizedSql.includes('FROM users u LEFT JOIN volunteer_profiles vp')) {
    const volunteerUsers = users.filter(u => u.role === 'Volunteer');
    const result = volunteerUsers.map(u => {
      const vp = volunteers.find(v => v.user_id === u.id);
      const volunteerTasks = assistanceRequests.filter(ar => ar.assigned_volunteer_id === u.id);
      const assignedTasksCount = volunteerTasks.length;
      const pendingTasksCount = volunteerTasks.filter(t => t.status !== 'Completed').length;
      const completedTasksCount = volunteerTasks.filter(t => t.status === 'Completed').length;
      return {
        user_id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        joined_at: u.created_at,
        skills: vp?.skills || 'Community Outreach & Logistics',
        availability: vp?.availability || 'Weekends / On-Call',
        status: vp?.status || 'Active',
        assigned_tasks_count: assignedTasksCount,
        pending_tasks_count: pendingTasksCount,
        completed_tasks_count: completedTasksCount
      };
    });
    return [result.reverse()];
  }

  // Volunteer: Tasks assigned to volunteer
  if (normalizedSql.includes('FROM assistance_requests ar') && normalizedSql.includes('ar.assigned_volunteer_id = ?')) {
    const volId = parseInt(params[0], 10);
    const tasks = assistanceRequests
      .filter(ar => ar.assigned_volunteer_id === volId)
      .map(ar => {
        const b = beneficiaries.find(x => x.id === ar.beneficiary_id);
        const allocations = resourceAllocations
          .filter(ra => ra.assistance_request_id === ar.id)
          .map(ra => {
            const item = inventoryItems.find(it => it.id === ra.inventory_item_id);
            return { ...ra, item_name: item?.name, item_unit: item?.unit };
          });
        return {
          ...ar,
          priority: ar.priority || 'Medium',
          deadline: ar.deadline || null,
          beneficiary_name: b?.name || 'Unknown',
          beneficiary_phone: b?.phone || '',
          beneficiary_address: b?.address || '',
          beneficiary_category: b?.category || '',
          allocations
        };
      })
      .reverse();
    return [tasks];
  }

  // Volunteer: Mark task delivered
  if (normalizedSql.includes('WHERE id = ? AND assigned_volunteer_id = ?')) {
    const newStatus = params.length === 3 ? params[0] : 'Completed';
    const reqId = parseInt(params[params.length - 2], 10);
    const volId = parseInt(params[params.length - 1], 10);
    const idx = assistanceRequests.findIndex(ar => ar.id === reqId && (ar.assigned_volunteer_id === volId || !volId));
    if (idx !== -1) {
      assistanceRequests[idx].status = newStatus;
      assistanceRequests[idx].updated_at = new Date().toISOString();
      writeFallbackAssistanceRequests(assistanceRequests);

      // Also mark resource allocations as Delivered and increment inventory quantity_distributed
      const matchedAllocations = resourceAllocations.filter(ra => ra.assistance_request_id === reqId);
      matchedAllocations.forEach(ra => {
        ra.distribution_status = 'Delivered';
        ra.updated_at = new Date().toISOString();
        const itIdx = inventoryItems.findIndex(it => it.id === ra.inventory_item_id);
        if (itIdx !== -1) {
          inventoryItems[itIdx].quantity_distributed = (inventoryItems[itIdx].quantity_distributed || 0) + (parseFloat(ra.quantity) || 0);
          inventoryItems[itIdx].updated_at = new Date().toISOString();
        }
      });
      writeFallbackResourceAllocations(resourceAllocations);
      writeFallbackInventoryItems(inventoryItems);

      return [{ affectedRows: 1 }];
    }
    return [{ affectedRows: 0 }];
  }

  // ==========================================================
  // V1.3 BENEFICIARIES FALLBACK HANDLERS
  // ==========================================================

  // Beneficiaries: Insert
  if (normalizedSql.startsWith('INSERT INTO beneficiaries')) {
    const nextId = beneficiaries.length > 0 ? Math.max(...beneficiaries.map(b => b.id || 0)) + 1 : 1;
    const now = getAugustTimestamp();
    const newBeneficiary = {
      id: nextId,
      name: params[0],
      phone: params[1] || '',
      email: params[2] || '',
      address: params[3] || '',
      category: params[4] || 'General',
      notes: params[5] || '',
      created_at: now,
      updated_at: now
    };
    beneficiaries.push(newBeneficiary);
    writeFallbackBeneficiaries(beneficiaries);
    return [{ insertId: nextId, affectedRows: 1 }];
  }

  // Beneficiaries: Find by phone or email
  if (normalizedSql.includes('FROM beneficiaries WHERE') && (normalizedSql.includes('phone = ?') || normalizedSql.includes('email = ?'))) {
    const p1 = (params[0] || '').toLowerCase().trim();
    const p2 = (params[1] || '').toLowerCase().trim();
    const match = beneficiaries.find(b => 
      (p1 && b.phone && b.phone.toLowerCase().trim() === p1) ||
      (p1 && b.email && b.email.toLowerCase().trim() === p1) ||
      (p2 && b.email && b.email.toLowerCase().trim() === p2) ||
      (p2 && b.phone && b.phone.toLowerCase().trim() === p2)
    );
    return [match ? [match] : []];
  }

  // Beneficiaries: List all with requests count
  if (normalizedSql.includes('FROM beneficiaries') && !normalizedSql.includes('WHERE id = ?') && !normalizedSql.includes('WHERE b.id = ?')) {
    let list = beneficiaries.map(b => {
      const totalRequests = assistanceRequests.filter(ar => ar.beneficiary_id === b.id).length;
      return { ...b, total_requests: totalRequests };
    });
    if (normalizedSql.includes('b.category = ?')) {
      const cat = params[0];
      if (cat && cat !== 'All') {
        list = list.filter(b => b.category === cat);
      }
    }
    if (normalizedSql.includes('lower(b.name) like ?')) {
      const searchParam = params.find(p => typeof p === 'string' && p.startsWith('%') && p.endsWith('%'));
      if (searchParam) {
        const s = searchParam.slice(1, -1).toLowerCase();
        list = list.filter(b => 
          (b.name && b.name.toLowerCase().includes(s)) ||
          (b.email && b.email.toLowerCase().includes(s)) ||
          (b.phone && b.phone.includes(s)) ||
          (b.address && b.address.toLowerCase().includes(s))
        );
      }
    }
    return [list.reverse()];
  }

  // Beneficiaries: Get by ID
  if (normalizedSql.includes('FROM beneficiaries') && (normalizedSql.includes('WHERE id = ?') || normalizedSql.includes('WHERE b.id = ?'))) {
    const bId = parseInt(params[0], 10);
    const match = beneficiaries.find(b => b.id === bId);
    return [match ? [match] : []];
  }

  // Beneficiaries: Update
  if (normalizedSql.startsWith('UPDATE beneficiaries SET')) {
    const bId = parseInt(params[6], 10);
    const idx = beneficiaries.findIndex(b => b.id === bId);
    if (idx !== -1) {
      beneficiaries[idx].name = params[0];
      beneficiaries[idx].phone = params[1];
      beneficiaries[idx].email = params[2];
      beneficiaries[idx].address = params[3];
      beneficiaries[idx].category = params[4];
      beneficiaries[idx].notes = params[5];
      beneficiaries[idx].updated_at = getAugustTimestamp();
      writeFallbackBeneficiaries(beneficiaries);
      return [{ affectedRows: 1 }];
    }
    return [{ affectedRows: 0 }];
  }

  // ==========================================================
  // V1.3 ASSISTANCE REQUESTS FALLBACK HANDLERS
  // ==========================================================

  // Assistance Requests: Insert
  if (normalizedSql.startsWith('INSERT INTO assistance_requests')) {
    const nextId = assistanceRequests.length > 0 ? Math.max(...assistanceRequests.map(r => r.id || 0)) + 1 : 1;
    const now = getAugustTimestamp();
    const newReq = {
      id: nextId,
      beneficiary_id: parseInt(params[0], 10),
      category: params[1] || 'General',
      description: params[2],
      quantity_needed: params[3] || '1',
      urgency: params[4] || 'Medium',
      priority: 'Medium',
      deadline: null,
      status: 'Submitted',
      reviewed_by: null,
      assigned_volunteer_id: null,
      admin_notes: null,
      created_at: now,
      updated_at: now
    };
    assistanceRequests.push(newReq);
    writeFallbackAssistanceRequests(assistanceRequests);
    return [{ insertId: nextId, affectedRows: 1 }];
  }

  // Assistance Requests: List for single beneficiary
  if (normalizedSql.includes('FROM assistance_requests') && normalizedSql.includes('beneficiary_id = ?')) {
    const bId = parseInt(params[0], 10);
    const list = assistanceRequests.filter(ar => ar.beneficiary_id === bId).map(ar => ({
      ...ar,
      priority: ar.priority || 'Medium',
      deadline: ar.deadline || null
    }));
    return [list.reverse()];
  }

  // Assistance Requests: Get by ID
  if (normalizedSql.includes('FROM assistance_requests') && (normalizedSql.includes('ar.id = ?') || normalizedSql.includes('WHERE id = ?'))) {
    const rId = parseInt(params[0], 10);
    const req = assistanceRequests.find(ar => ar.id === rId);
    if (!req) return [[]];
    const b = beneficiaries.find(x => x.id === req.beneficiary_id);
    const reviewer = users.find(u => u.id === req.reviewed_by);
    const volunteer = users.find(u => u.id === req.assigned_volunteer_id);
    const allocations = resourceAllocations
      .filter(ra => ra.assistance_request_id === req.id)
      .map(ra => {
        const it = inventoryItems.find(x => x.id === ra.inventory_item_id);
        return { ...ra, item_name: it?.name, item_unit: it?.unit, item_category: it?.category };
      });
    return [[{
      ...req,
      priority: req.priority || 'Medium',
      deadline: req.deadline || null,
      beneficiary_name: b?.name || 'Unknown',
      beneficiary_phone: b?.phone || '',
      beneficiary_email: b?.email || '',
      beneficiary_address: b?.address || '',
      beneficiary_category: b?.category || '',
      reviewer_name: reviewer?.name || null,
      volunteer_name: volunteer?.name || null,
      volunteer_phone: volunteer?.phone || null,
      allocations
    }]];
  }

  // Assistance Requests: List all (with filters)
  if (normalizedSql.includes('FROM assistance_requests ar')) {
    let list = assistanceRequests.map(ar => {
      const b = beneficiaries.find(x => x.id === ar.beneficiary_id);
      const reviewer = users.find(u => u.id === ar.reviewed_by);
      const volunteer = users.find(u => u.id === ar.assigned_volunteer_id);
      const allocations = resourceAllocations
        .filter(ra => ra.assistance_request_id === ar.id)
        .map(ra => {
          const it = inventoryItems.find(x => x.id === ra.inventory_item_id);
          return { ...ra, item_name: it?.name, item_unit: it?.unit };
        });
      return {
        ...ar,
        priority: ar.priority || 'Medium',
        deadline: ar.deadline || null,
        beneficiary_name: b?.name || 'Unknown',
        beneficiary_phone: b?.phone || '',
        beneficiary_email: b?.email || '',
        beneficiary_address: b?.address || '',
        beneficiary_category: b?.category || '',
        reviewer_name: reviewer?.name || null,
        volunteer_name: volunteer?.name || null,
        volunteer_phone: volunteer?.phone || null,
        allocations
      };
    });

    if (params && params.length > 0) {
      if (normalizedSql.includes('ar.status = ?')) {
        const s = params.find(p => ['Submitted', 'Under Review', 'Approved', 'Rejected', 'Resources Allocated', 'Volunteer Assigned', 'Completed'].includes(p));
        if (s && s !== 'All') list = list.filter(r => r.status === s);
      }
      if (normalizedSql.includes('ar.priority = ?')) {
        const p = params.find(param => ['Low', 'Medium', 'High'].includes(param));
        if (p && p !== 'All') list = list.filter(r => (r.priority || 'Medium') === p);
      }
    }
    return [list.reverse()];
  }

  // Assistance Requests: Review (Approve/Reject)
  if (normalizedSql.startsWith('UPDATE assistance_requests SET status = ?, admin_notes = ?, reviewed_by = ? WHERE id = ?')) {
    const s = params[0];
    const notes = params[1];
    const adminId = parseInt(params[2], 10);
    const rId = parseInt(params[3], 10);
    const idx = assistanceRequests.findIndex(ar => ar.id === rId);
    if (idx !== -1) {
      assistanceRequests[idx].status = s;
      assistanceRequests[idx].admin_notes = notes;
      assistanceRequests[idx].reviewed_by = adminId;
      assistanceRequests[idx].updated_at = getAugustTimestamp();
      writeFallbackAssistanceRequests(assistanceRequests);
      return [{ affectedRows: 1 }];
    }
    return [{ affectedRows: 0 }];
  }

  // Assistance Requests: Update status & assign volunteer
  if (normalizedSql.startsWith('UPDATE assistance_requests SET status = ?, assigned_volunteer_id = ?')) {
    const s = params[0];
    const volId = params[1] ? parseInt(params[1], 10) : null;
    const notes = params[2];
    const rId = parseInt(params[3], 10);
    const idx = assistanceRequests.findIndex(ar => ar.id === rId);
    if (idx !== -1) {
      assistanceRequests[idx].status = s;
      if (volId) assistanceRequests[idx].assigned_volunteer_id = volId;
      if (notes) assistanceRequests[idx].admin_notes = notes;
      assistanceRequests[idx].updated_at = getAugustTimestamp();
      writeFallbackAssistanceRequests(assistanceRequests);
      return [{ affectedRows: 1 }];
    }
    return [{ affectedRows: 0 }];
  }

  // ==========================================================
  // V1.3 INVENTORY FALLBACK HANDLERS
  // ==========================================================

  // Inventory: List all items
  if (normalizedSql.includes('FROM inventory_items') && !normalizedSql.includes('WHERE id = ?')) {
    const list = inventoryItems.map(it => ({
      ...it,
      is_low_stock: (parseFloat(it.quantity_available) || 0) <= (parseFloat(it.low_stock_threshold) || 0)
    }));
    return [list];
  }

  // Inventory: Get by ID
  if (normalizedSql.includes('FROM inventory_items WHERE id = ?')) {
    const itId = parseInt(params[0], 10);
    const match = inventoryItems.find(it => it.id === itId);
    if (!match) return [[]];
    return [[{
      ...match,
      is_low_stock: (parseFloat(match.quantity_available) || 0) <= (parseFloat(match.low_stock_threshold) || 0)
    }]];
  }

  // Inventory: Insert new item
  if (normalizedSql.startsWith('INSERT INTO inventory_items')) {
    const nextId = inventoryItems.length > 0 ? Math.max(...inventoryItems.map(it => it.id || 0)) + 1 : 1;
    const now = getAugustTimestamp();
    const newItem = {
      id: nextId,
      name: params[0],
      category: params[1] || 'General',
      unit: params[2],
      quantity_available: parseFloat(params[3]) || 0,
      quantity_distributed: 0,
      low_stock_threshold: parseFloat(params[4]) || 0,
      created_at: now,
      updated_at: now
    };
    inventoryItems.push(newItem);
    writeFallbackInventoryItems(inventoryItems);
    return [{ insertId: nextId, affectedRows: 1 }];
  }

  // Inventory: Update item
  if (normalizedSql.startsWith('UPDATE inventory_items SET')) {
    const itId = parseInt(params[params.length - 1], 10);
    const idx = inventoryItems.findIndex(it => it.id === itId);
    if (idx !== -1) {
      if (normalizedSql.includes('quantity_available = ?')) {
        inventoryItems[idx].quantity_available = parseFloat(params[0]) || 0;
      }
      if (normalizedSql.includes('low_stock_threshold = ?')) {
        const thresholdVal = params[1] !== undefined ? params[1] : params[0];
        inventoryItems[idx].low_stock_threshold = parseFloat(thresholdVal) || 0;
      }
      if (normalizedSql.includes('name = ?')) {
        inventoryItems[idx].name = params[0];
        inventoryItems[idx].category = params[1];
        inventoryItems[idx].unit = params[2];
      }
      inventoryItems[idx].updated_at = getAugustTimestamp();
      writeFallbackInventoryItems(inventoryItems);
      return [{ affectedRows: 1 }];
    }
    return [{ affectedRows: 0 }];
  }

  // Inventory History: Insert
  if (normalizedSql.startsWith('INSERT INTO inventory_history')) {
    const nextId = inventoryHistory.length > 0 ? Math.max(...inventoryHistory.map(h => h.id || 0)) + 1 : 1;
    const now = getAugustTimestamp();
    const newHistory = {
      id: nextId,
      inventory_item_id: parseInt(params[0], 10),
      change_type: params[1],
      quantity: parseFloat(params[2]) || 0,
      reason: params[3] || '',
      reference_type: params[4] || null,
      reference_id: params[5] ? parseInt(params[5], 10) : null,
      performed_by: parseInt(params[6], 10),
      created_at: now
    };
    inventoryHistory.push(newHistory);
    writeFallbackInventoryHistory(inventoryHistory);
    return [{ insertId: nextId, affectedRows: 1 }];
  }

  // Inventory History: Get by item ID
  if (normalizedSql.includes('FROM inventory_history') && normalizedSql.includes('inventory_item_id = ?')) {
    const itId = parseInt(params[0], 10);
    const list = inventoryHistory
      .filter(h => h.inventory_item_id === itId)
      .map(h => {
        const u = users.find(x => x.id === h.performed_by);
        return { ...h, performed_by_name: u?.name || 'Administrator' };
      })
      .reverse();
    return [list];
  }

  // ==========================================================
  // V1.3 RESOURCE ALLOCATIONS FALLBACK HANDLERS
  // ==========================================================

  // Resource Allocations: Insert
  if (normalizedSql.startsWith('INSERT INTO resource_allocations')) {
    const nextId = resourceAllocations.length > 0 ? Math.max(...resourceAllocations.map(ra => ra.id || 0)) + 1 : 1;
    const now = getAugustTimestamp();
    const newRa = {
      id: nextId,
      assistance_request_id: parseInt(params[0], 10),
      inventory_item_id: parseInt(params[1], 10),
      quantity: parseFloat(params[2]) || 0,
      allocated_by: parseInt(params[3], 10),
      distribution_status: 'Allocated',
      created_at: now,
      updated_at: now
    };
    resourceAllocations.push(newRa);
    writeFallbackResourceAllocations(resourceAllocations);
    return [{ insertId: nextId, affectedRows: 1 }];
  }

  // Resource Allocations: Get by assistance_request_id
  if (normalizedSql.includes('FROM resource_allocations') && normalizedSql.includes('assistance_request_id = ?')) {
    const rId = parseInt(params[0], 10);
    const list = resourceAllocations
      .filter(ra => ra.assistance_request_id === rId)
      .map(ra => {
        const it = inventoryItems.find(x => x.id === ra.inventory_item_id);
        return { ...ra, item_name: it?.name, item_unit: it?.unit, item_category: it?.category };
      });
    return [list];
  }

  // ==========================================================
  // V2.1 NOTIFICATIONS FALLBACK HANDLERS
  // ==========================================================

  // Notifications: Insert
  if (normalizedSql.startsWith('INSERT INTO notifications')) {
    const nextId = notifications.length > 0 ? Math.max(...notifications.map(n => n.id || 0)) + 1 : 1;
    const now = getAugustTimestamp();
    const newNotif = {
      id: nextId,
      recipient_id: parseInt(params[0], 10),
      type: params[1],
      message: params[2],
      reference_type: params[3] || null,
      reference_id: params[4] ? parseInt(params[4], 10) : null,
      is_read: false,
      created_at: now
    };
    notifications.push(newNotif);
    writeFallbackNotifications(notifications);
    return [{ insertId: nextId, affectedRows: 1 }];
  }

  // Notifications: Count unread
  if (normalizedSql.includes('FROM notifications') && normalizedSql.includes('COUNT(')) {
    const rId = parseInt(params[0], 10);
    const count = notifications.filter(n => n.recipient_id === rId && !n.is_read).length;
    return [[{ unread_count: count, count }]];
  }

  // Notifications: Get by recipient
  if (normalizedSql.includes('FROM notifications') && normalizedSql.includes('recipient_id = ?')) {
    const rId = parseInt(params[0], 10);
    const list = notifications
      .filter(n => n.recipient_id === rId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return [list];
  }

  // Notifications: Mark single as read
  if (/UPDATE notifications SET is_read = (TRUE|1|true) WHERE id = \? AND recipient_id = \?/i.test(normalizedSql)) {
    const nId = parseInt(params[0], 10);
    const rId = parseInt(params[1], 10);
    const idx = notifications.findIndex(n => n.id === nId && n.recipient_id === rId);
    if (idx !== -1) {
      notifications[idx].is_read = true;
      writeFallbackNotifications(notifications);
      return [{ affectedRows: 1 }];
    }
    return [{ affectedRows: 0 }];
  }

  // Notifications: Mark all as read
  if (/UPDATE notifications SET is_read = (TRUE|1|true) WHERE recipient_id = \?/i.test(normalizedSql)) {
    const rId = parseInt(params[0], 10);
    let count = 0;
    notifications.forEach(n => {
      if (n.recipient_id === rId && !n.is_read) {
        n.is_read = true;
        count++;
      }
    });
    if (count > 0) writeFallbackNotifications(notifications);
    return [{ affectedRows: count }];
  }

  // ==========================================================
  // V2.1 VOLUNTEER TASK TRACKING & PRIORITY UPDATES
  // ==========================================================

  // Assistance Requests: Update priority & deadline (Admin)
  if (normalizedSql.startsWith('UPDATE assistance_requests SET priority = ?, deadline = ? WHERE id = ?')) {
    const priority = params[0] || 'Medium';
    const deadline = params[1] || null;
    const rId = parseInt(params[2], 10);
    const idx = assistanceRequests.findIndex(ar => ar.id === rId);
    if (idx !== -1) {
      assistanceRequests[idx].priority = priority;
      assistanceRequests[idx].deadline = deadline;
      assistanceRequests[idx].updated_at = getAugustTimestamp();
      writeFallbackAssistanceRequests(assistanceRequests);
      return [{ affectedRows: 1 }];
    }
    return [{ affectedRows: 0 }];
  }

  // Assistance Requests: Volunteer status update (e.g. In Progress / Completed)
  if (normalizedSql.startsWith('UPDATE assistance_requests SET status = ? WHERE id = ? AND assigned_volunteer_id = ?')) {
    const s = params[0];
    const rId = parseInt(params[1], 10);
    const vId = parseInt(params[2], 10);
    const idx = assistanceRequests.findIndex(ar => ar.id === rId && ar.assigned_volunteer_id === vId);
    if (idx !== -1) {
      assistanceRequests[idx].status = s;
      assistanceRequests[idx].updated_at = getAugustTimestamp();
      writeFallbackAssistanceRequests(assistanceRequests);
      return [{ affectedRows: 1 }];
    }
    return [{ affectedRows: 0 }];
  }

  // ==========================================================
  // V2.1 DONORS LIST FALLBACK HANDLER
  // ==========================================================
  if (normalizedSql.includes("WHERE u.role = 'Donor'") || normalizedSql.includes("WHERE role = 'Donor'")) {
    let donorsList = users.filter(u => u.role === 'Donor').map(u => {
      const userDonations = donations.filter(d => (d.donor_id && d.donor_id === u.id) || (d.donor_email && d.donor_email.toLowerCase() === u.email.toLowerCase()));
      const totalDonated = userDonations
        .filter(d => d.donation_type === 'Money' && (d.status === 'Completed' || d.status === 'Verified'))
        .reduce((acc, d) => acc + (parseFloat(d.amount) || 0), 0);
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        created_at: u.created_at,
        donations_count: userDonations.length,
        total_donations_count: userDonations.length,
        total_donated: totalDonated,
        total_amount_donated: totalDonated
      };
    });
    return [donorsList];
  }

  // ==========================================================
  // V2.3 DONATION STATUS HISTORY FALLBACK HANDLERS
  // ==========================================================
  if (normalizedSql.startsWith('INSERT INTO donation_status_history')) {
    const nextId = donationStatusHistory.length > 0 ? Math.max(...donationStatusHistory.map(h => h.id || 0)) + 1 : 1;
    const newRecord = {
      id: nextId,
      donation_id: parseInt(params[0], 10),
      status: params[1],
      changed_by: params[2] ? parseInt(params[2], 10) : null,
      created_at: params[3] || getAugustTimestamp()
    };
    donationStatusHistory.push(newRecord);
    writeFallbackDonationStatusHistory(donationStatusHistory);
    return [{ insertId: nextId, affectedRows: 1 }];
  }

  if (normalizedSql.includes('FROM donation_status_history') || normalizedSql.includes('FROM donation_status_history h')) {
    const donationId = parseInt(params[0], 10);
    const records = donationStatusHistory
      .filter(h => h.donation_id === donationId)
      .sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0))
      .map(h => {
        const changer = h.changed_by ? users.find(u => u.id === h.changed_by) : null;
        return {
          ...h,
          changed_by_name: changer ? changer.name : (h.changed_by ? 'Administrator' : 'System / Online Pledge')
        };
      });
    return [records];
  }

  // ==========================================================
  // V2.3 FEEDBACK FALLBACK HANDLERS
  // ==========================================================
  if (normalizedSql.startsWith('INSERT INTO feedback')) {
    const userId = parseInt(params[0], 10);
    const feedbackType = params[1];
    const referenceId = parseInt(params[2], 10);
    const rating = parseInt(params[3], 10);
    const comment = params[4] || '';

    // Check unique constraint: (user_id, feedback_type, reference_id)
    const existing = feedback.find(f => f.user_id === userId && f.feedback_type === feedbackType && f.reference_id === referenceId);
    if (existing) {
      const err = new Error("Duplicate entry: Feedback already submitted for this target.");
      err.code = 'ER_DUP_ENTRY';
      throw err;
    }

    const nextId = feedback.length > 0 ? Math.max(...feedback.map(f => f.id || 0)) + 1 : 1;
    const now = getAugustTimestamp();
    const newFeedback = {
      id: nextId,
      user_id: userId,
      feedback_type: feedbackType,
      reference_id: referenceId,
      rating,
      comment,
      created_at: now,
      updated_at: now
    };
    feedback.push(newFeedback);
    writeFallbackFeedback(feedback);
    return [{ insertId: nextId, affectedRows: 1 }];
  }

  if (normalizedSql.startsWith('UPDATE feedback SET rating = ?, comment = ?') || normalizedSql.startsWith('UPDATE feedback')) {
    const rating = parseInt(params[0], 10);
    const comment = params[1];
    const feedbackId = parseInt(params[3] !== undefined ? params[3] : params[2], 10);
    const userId = params[4] !== undefined ? parseInt(params[4], 10) : null;

    const idx = feedback.findIndex(f => f.id === feedbackId && (!userId || f.user_id === userId));
    if (idx !== -1) {
      feedback[idx].rating = rating;
      feedback[idx].comment = comment;
      feedback[idx].updated_at = getAugustTimestamp();
      writeFallbackFeedback(feedback);
      return [{ affectedRows: 1 }];
    }
    return [{ affectedRows: 0 }];
  }

  if (normalizedSql.includes('FROM feedback') || normalizedSql.includes('FROM feedback f')) {
    // Check if target lookup: WHERE user_id = ? AND feedback_type = ? AND reference_id = ?
    if (normalizedSql.includes('WHERE f.user_id = ? AND f.feedback_type = ? AND f.reference_id = ?') ||
        normalizedSql.includes('WHERE user_id = ? AND feedback_type = ? AND reference_id = ?')) {
      const uId = parseInt(params[0], 10);
      const fType = params[1];
      const rId = parseInt(params[2], 10);
      const match = feedback.filter(f => f.user_id === uId && f.feedback_type === fType && f.reference_id === rId);
      return [match];
    }

    // Check if specific ID lookup: WHERE id = ?
    if (normalizedSql.includes('WHERE f.id = ?') || normalizedSql.includes('WHERE id = ?')) {
      const fId = parseInt(params[0], 10);
      const match = feedback.filter(f => f.id === fId);
      return [match];
    }

    // Check if mine lookup: WHERE f.user_id = ?
    if (normalizedSql.includes('WHERE f.user_id = ?') || normalizedSql.includes('WHERE user_id = ?')) {
      const uId = parseInt(params[0], 10);
      const mine = feedback
        .filter(f => f.user_id === uId)
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
        .map(f => {
          const userObj = users.find(u => u.id === f.user_id);
          let targetTitle = '';
          if (f.feedback_type === 'Campaign') {
            const camp = campaigns.find(c => c.id === f.reference_id);
            targetTitle = camp ? camp.title : `Campaign #${f.reference_id}`;
          } else if (f.feedback_type === 'Donation') {
            const don = donations.find(d => d.id === f.reference_id);
            targetTitle = don ? `Donation ${don.token} (${don.donation_type})` : `Donation #${f.reference_id}`;
          } else if (f.feedback_type === 'VolunteerTask') {
            const req = assistanceRequests.find(r => r.id === f.reference_id);
            targetTitle = req ? `Task: ${req.assistance_type || req.category || 'Relief Aid'}` : `Task #${f.reference_id}`;
          }
          return {
            ...f,
            user_name: userObj ? userObj.name : 'Unknown',
            user_email: userObj ? userObj.email : '',
            user_role: userObj ? userObj.role : 'Donor',
            target_title: targetTitle
          };
        });
      return [mine];
    }

    // Otherwise Admin all feedback list with filters:
    let list = feedback
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .map(f => {
        const userObj = users.find(u => u.id === f.user_id);
        let targetTitle = '';
        if (f.feedback_type === 'Campaign') {
          const camp = campaigns.find(c => c.id === f.reference_id);
          targetTitle = camp ? camp.title : `Campaign #${f.reference_id}`;
        } else if (f.feedback_type === 'Donation') {
          const don = donations.find(d => d.id === f.reference_id);
          targetTitle = don ? `Donation ${don.token} (${don.donation_type})` : `Donation #${f.reference_id}`;
        } else if (f.feedback_type === 'VolunteerTask') {
          const req = assistanceRequests.find(r => r.id === f.reference_id);
          targetTitle = req ? `Task: ${req.assistance_type || req.category || 'Relief Aid'}` : `Task #${f.reference_id}`;
        }
        return {
          ...f,
          user_name: userObj ? userObj.name : 'Unknown',
          user_email: userObj ? userObj.email : '',
          user_role: userObj ? userObj.role : 'Donor',
          target_title: targetTitle
        };
      });
    return [list];
  }

  // 26. INSERT INTO chatbot_logs (user_id, message, response) VALUES (?, ?, ?)
  if (normalizedSql.startsWith('INSERT INTO chatbot_logs')) {
    const chatbotLogs = readFallbackChatbotLogs();
    const nextId = chatbotLogs.length > 0 ? Math.max(...chatbotLogs.map(l => l.id || 0)) + 1 : 1;
    const now = new Date().toISOString();
    const newLog = {
      id: nextId,
      user_id: params[0] || null,
      message: params[1] || '',
      response: params[2] || '',
      created_at: now
    };
    chatbotLogs.push(newLog);
    writeFallbackChatbotLogs(chatbotLogs);
    return [{ insertId: nextId, affectedRows: 1 }];
  }

  // 27. SELECT ... FROM chatbot_logs
  if (normalizedSql.includes('FROM chatbot_logs')) {
    const chatbotLogs = readFallbackChatbotLogs();
    return [chatbotLogs];
  }

  // ==========================================================
  // V3.2 VOLUNTEER POINTS & GAMIFICATION FALLBACK HANDLERS
  // ==========================================================
  if (normalizedSql.includes('FROM volunteer_points')) {
    const vpList = readFallbackVolunteerPoints();
    if (normalizedSql.includes('WHERE user_id = ?')) {
      const uId = parseInt(params[0], 10);
      const found = vpList.find(p => p.user_id === uId);
      return [found ? [found] : []];
    }
    return [vpList];
  }

  if (normalizedSql.startsWith('INSERT INTO volunteer_points') || normalizedSql.includes('INTO volunteer_points')) {
    const vpList = readFallbackVolunteerPoints();
    const uId = parseInt(params[0], 10);
    const pts = parseInt(params[1], 10);
    const now = getAugustTimestamp();
    const existingIdx = vpList.findIndex(p => p.user_id === uId);
    if (existingIdx !== -1) {
      if (normalizedSql.includes('ON DUPLICATE KEY UPDATE') || normalizedSql.includes('UPDATE')) {
        vpList[existingIdx].total_points = parseInt(params[2] !== undefined ? params[2] : pts, 10);
        vpList[existingIdx].updated_at = now;
      }
      writeFallbackVolunteerPoints(vpList);
      return [{ affectedRows: 1, insertId: vpList[existingIdx].id }];
    } else {
      const nextId = vpList.length > 0 ? Math.max(...vpList.map(p => p.id || 0)) + 1 : 1;
      const newRec = { id: nextId, user_id: uId, total_points: pts, updated_at: now };
      vpList.push(newRec);
      writeFallbackVolunteerPoints(vpList);
      return [{ insertId: nextId, affectedRows: 1 }];
    }
  }

  if (normalizedSql.startsWith('UPDATE volunteer_points SET total_points = ? WHERE user_id = ?')) {
    const vpList = readFallbackVolunteerPoints();
    const pts = parseInt(params[0], 10);
    const uId = parseInt(params[1], 10);
    const idx = vpList.findIndex(p => p.user_id === uId);
    if (idx !== -1) {
      vpList[idx].total_points = pts;
      vpList[idx].updated_at = getAugustTimestamp();
      writeFallbackVolunteerPoints(vpList);
      return [{ affectedRows: 1 }];
    }
    return [{ affectedRows: 0 }];
  }

  // Point Transactions
  if (normalizedSql.startsWith('INSERT INTO point_transactions')) {
    const ptList = readFallbackPointTransactions();
    const nextId = ptList.length > 0 ? Math.max(...ptList.map(t => t.id || 0)) + 1 : 1;
    const newTx = {
      id: nextId,
      user_id: parseInt(params[0], 10),
      points: parseInt(params[1], 10),
      reason: params[2] || '',
      reference_type: params[3] || null,
      reference_id: params[4] ? parseInt(params[4], 10) : null,
      created_at: getAugustTimestamp()
    };
    ptList.push(newTx);
    writeFallbackPointTransactions(ptList);
    return [{ insertId: nextId, affectedRows: 1 }];
  }

  if (normalizedSql.includes('FROM point_transactions')) {
    const ptList = readFallbackPointTransactions();
    if (normalizedSql.includes('WHERE user_id = ?')) {
      const uId = parseInt(params[0], 10);
      const list = ptList.filter(t => t.user_id === uId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return [list];
    }
    return [ptList];
  }

  // Badges & User Badges
  if (normalizedSql.includes('FROM badges')) {
    const badges = readFallbackBadges();
    return [badges];
  }

  if (normalizedSql.startsWith('INSERT INTO user_badges') || normalizedSql.startsWith('INSERT IGNORE INTO user_badges')) {
    const ubList = readFallbackUserBadges();
    const uId = parseInt(params[0], 10);
    const bId = parseInt(params[1], 10);
    const existing = ubList.find(b => b.user_id === uId && b.badge_id === bId);
    if (existing) {
      return [{ affectedRows: 0 }];
    }
    const nextId = ubList.length > 0 ? Math.max(...ubList.map(b => b.id || 0)) + 1 : 1;
    const newUb = {
      id: nextId,
      user_id: uId,
      badge_id: bId,
      earned_at: params[2] || getAugustTimestamp()
    };
    ubList.push(newUb);
    writeFallbackUserBadges(ubList);
    return [{ insertId: nextId, affectedRows: 1 }];
  }

  if (normalizedSql.includes('FROM user_badges')) {
    const ubList = readFallbackUserBadges();
    if (normalizedSql.includes('WHERE user_id = ?')) {
      const uId = parseInt(params[0], 10);
      const list = ubList.filter(b => b.user_id === uId);
      return [list];
    }
    return [ubList];
  }

  // Notification Preferences
  if (normalizedSql.includes('FROM notification_preferences')) {
    const npList = readFallbackNotificationPreferences();
    if (normalizedSql.includes('WHERE user_id = ?')) {
      const uId = parseInt(params[0], 10);
      const list = npList.filter(p => p.user_id === uId);
      return [list];
    }
    return [npList];
  }

  if (normalizedSql.startsWith('INSERT INTO notification_preferences')) {
    const npList = readFallbackNotificationPreferences();
    const uId = parseInt(params[0], 10);
    const type = params[1];
    const enabled = params[2] !== undefined ? Boolean(params[2]) : true;
    const existingIdx = npList.findIndex(p => p.user_id === uId && p.notification_type === type);
    if (existingIdx !== -1) {
      npList[existingIdx].enabled = enabled;
      writeFallbackNotificationPreferences(npList);
      return [{ affectedRows: 1 }];
    } else {
      const nextId = npList.length > 0 ? Math.max(...npList.map(p => p.id || 0)) + 1 : 1;
      npList.push({ id: nextId, user_id: uId, notification_type: type, enabled });
      writeFallbackNotificationPreferences(npList);
      return [{ insertId: nextId, affectedRows: 1 }];
    }
  }

  // Admin Audit Log
  if (normalizedSql.startsWith('INSERT INTO admin_audit_log')) {
    const auditLogs = readFallbackAdminAuditLog();
    const nextId = auditLogs.length > 0 ? Math.max(...auditLogs.map(l => l.id || 0)) + 1 : 1;
    const newEntry = {
      id: nextId,
      admin_id: parseInt(params[0], 10),
      action: params[1] || '',
      target_type: params[2] || null,
      target_id: params[3] ? parseInt(params[3], 10) : null,
      details: params[4] || '',
      ip_address: params[5] || '192.168.1.10',
      created_at: params[6] || getAugustTimestamp()
    };
    auditLogs.push(newEntry);
    writeFallbackAdminAuditLog(auditLogs);
    return [{ insertId: nextId, affectedRows: 1 }];
  }

  if (normalizedSql.includes('FROM admin_audit_log')) {
    const auditLogs = readFallbackAdminAuditLog();
    let enriched = auditLogs.map(log => {
      const adminUser = users.find(u => u.id === log.admin_id);
      return {
        ...log,
        admin_name: adminUser ? adminUser.name : (log.admin_name || `Admin #${log.admin_id}`),
        admin_email: adminUser ? adminUser.email : (log.admin_email || '')
      };
    });

    // Check filters
    if (params && params.length > 0) {
      if (normalizedSql.includes('al.action = ?') && normalizedSql.includes('al.target_type = ?')) {
        enriched = enriched.filter(l => l.action === params[0] && l.target_type === params[1]);
      } else if (normalizedSql.includes('al.action = ?')) {
        enriched = enriched.filter(l => l.action === params[0]);
      } else if (normalizedSql.includes('al.target_type = ?')) {
        enriched = enriched.filter(l => l.target_type === params[0]);
      }
    }

    if (normalizedSql.toUpperCase().includes('COUNT(')) {
      return [[{ total: enriched.length }]];
    }

    enriched.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

    // Handle pagination (LIMIT ? OFFSET ?)
    if (normalizedSql.includes('LIMIT ? OFFSET ?') && params && params.length >= 2) {
      const limit = parseInt(params[params.length - 2], 10);
      const offset = parseInt(params[params.length - 1], 10);
      enriched = enriched.slice(offset, offset + limit);
    }

    return [enriched];
  }

  // User Management Updates (Soft-disable & Role updates)
  if (normalizedSql.includes('UPDATE users SET is_active =')) {
    let isActive = false;
    let uId = null;

    if (normalizedSql.includes('is_active = FALSE') || normalizedSql.includes('is_active = 0')) {
      isActive = false;
      uId = parseInt(params[0], 10);
    } else if (normalizedSql.includes('is_active = TRUE') || normalizedSql.includes('is_active = 1')) {
      isActive = true;
      uId = parseInt(params[0], 10);
    } else {
      isActive = Boolean(params[0]);
      uId = parseInt(params[1], 10);
    }

    const idx = users.findIndex(u => u.id === uId);
    if (idx !== -1) {
      users[idx].is_active = isActive;
      users[idx].updated_at = getAugustTimestamp();
      writeFallbackData(users);
      return [{ affectedRows: 1 }];
    }
    return [{ affectedRows: 0 }];
  }

  if (normalizedSql.startsWith('UPDATE users SET role = ? WHERE id = ?')) {
    const newRole = params[0];
    const uId = parseInt(params[1], 10);
    const idx = users.findIndex(u => u.id === uId);
    if (idx !== -1) {
      users[idx].role = newRole;
      users[idx].updated_at = getAugustTimestamp();
      writeFallbackData(users);
      return [{ affectedRows: 1 }];
    }
    return [{ affectedRows: 0 }];
  }

  // Volunteer Leaderboard: list active volunteers
  if (normalizedSql.includes('FROM users') && normalizedSql.includes("role = 'Volunteer'") && normalizedSql.includes('is_active = TRUE')) {
    const activeVolunteers = users.filter(u => u.role === 'Volunteer' && u.is_active !== false && u.is_active !== 0);
    return [activeVolunteers];
  }

  // Leaderboard: completed tasks
  if (normalizedSql.includes('FROM assistance_requests') && normalizedSql.includes("status = 'Completed'")) {
    const completedReqs = readFallbackAssistanceRequests().filter(r => r.status === 'Completed');
    return [completedReqs];
  }

  // Admin User Management: paginated/filtered list of users
  if (normalizedSql.includes('FROM users WHERE 1=1') || normalizedSql.includes('FROM users ORDER BY created_at DESC')) {
    let filtered = [...users];

    // Status filter
    if (normalizedSql.includes('is_active = TRUE') || normalizedSql.includes('is_active = 1')) {
      filtered = filtered.filter(u => u.is_active !== false && u.is_active !== 0);
    } else if (normalizedSql.includes('is_active = FALSE') || normalizedSql.includes('is_active = 0')) {
      filtered = filtered.filter(u => u.is_active === false || u.is_active === 0);
    }

    // Role filter
    if (normalizedSql.includes('role = ?') && params && params.length > 0) {
      const roleParam = params.find(p => ['Donor', 'Volunteer', 'Admin'].includes(p));
      if (roleParam) {
        filtered = filtered.filter(u => u.role === roleParam);
      }
    }

    // Search filter
    if (normalizedSql.includes('LOWER(name) LIKE ?') && params && params.length > 0) {
      const searchParam = (params[0] || '').replace(/%/g, '').toLowerCase();
      if (searchParam) {
        filtered = filtered.filter(u => 
          (u.name && u.name.toLowerCase().includes(searchParam)) ||
          (u.email && u.email.toLowerCase().includes(searchParam))
        );
      }
    }

    // Check if count query
    if (normalizedSql.toUpperCase().includes('COUNT(')) {
      return [[{ total: filtered.length }]];
    }

    filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

    // Handle pagination (LIMIT ? OFFSET ?)
    if (normalizedSql.includes('LIMIT ? OFFSET ?') && params && params.length >= 2) {
      const limit = parseInt(params[params.length - 2], 10);
      const offset = parseInt(params[params.length - 1], 10);
      filtered = filtered.slice(offset, offset + limit);
    }

    return [filtered];
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
  getIsUsingMySQL: () => isUsingMySQL,
  readFallbackData,
  writeFallbackData,
  readFallbackCampaigns,
  writeFallbackCampaigns,
  readFallbackDonations,
  writeFallbackDonations,
  readFallbackVolunteers,
  writeFallbackVolunteers,
  readFallbackBeneficiaries,
  writeFallbackBeneficiaries,
  readFallbackAssistanceRequests,
  writeFallbackAssistanceRequests,
  readFallbackInventoryItems,
  writeFallbackInventoryItems,
  readFallbackInventoryHistory,
  writeFallbackInventoryHistory,
  readFallbackResourceAllocations,
  writeFallbackResourceAllocations,
  readFallbackNotifications,
  writeFallbackNotifications,
  readFallbackFeedback,
  writeFallbackFeedback,
  readFallbackDonationStatusHistory,
  writeFallbackDonationStatusHistory,
  readFallbackChatbotLogs,
  writeFallbackChatbotLogs,
  readFallbackVolunteerPoints,
  writeFallbackVolunteerPoints,
  readFallbackPointTransactions,
  writeFallbackPointTransactions,
  readFallbackBadges,
  writeFallbackBadges,
  readFallbackUserBadges,
  writeFallbackUserBadges,
  readFallbackNotificationPreferences,
  writeFallbackNotificationPreferences,
  readFallbackAdminAuditLog,
  writeFallbackAdminAuditLog
};



