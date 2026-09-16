-- SevaConnect Database Schema V1.1 (Foundation & Authentication)

CREATE DATABASE IF NOT EXISTS sevaconnect
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sevaconnect;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('Donor', 'Admin', 'Volunteer') NOT NULL DEFAULT 'Donor',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SevaConnect Database Schema V1.2 (Campaigns & Donations)

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

-- Initial Seed Campaigns for all categories (with August 2026 start dates)
INSERT IGNORE INTO campaigns (id, title, description, goal_amount, start_date, deadline, category, status, created_by) VALUES
(1, 'Slum Child Education & Evening Nutrition Drive', 'Empowering 250+ underprivileged children in urban slums with evening remedial education classes, learning supplies, and daily wholesome nutritional meals.', 150000.00, '2026-08-01', '2026-12-31', 'Education', 'Active', 2),
(2, 'Clean Drinking Water & Sanitation Well Project', 'Constructing deep borewells and gravity-fed water filtration stations across drought-affected rural communities in the dry belts.', 220000.00, '2026-08-05', '2026-11-30', 'Healthcare', 'Active', 2),
(3, 'Emergency Flood Relief & Food Ration Kits', 'Mobilizing essential emergency relief kits containing dry grains, pulses, baby food, clean water packets, and hygiene essentials for 500 families.', 300000.00, '2026-08-10', '2026-10-15', 'Disaster Relief', 'Active', 2),
(4, 'Senior Citizen Warmth & Community Care Outreach', 'Providing shelter assistance, winter blankets, mobility walking aids, and daily companionship support for abandoned elderly citizens.', 120000.00, '2026-08-12', '2026-11-20', 'Community Care', 'Active', 2),
(5, 'Daily Malnutrition Prevention & Midday Meal Drive', 'Serving fresh, protein-rich hot meals, vitamin supplements, and clean drinking water to over 400 malnourished children and mothers.', 180000.00, '2026-08-15', '2026-12-15', 'Nutrition', 'Active', 2),
(6, 'Rural Mobile Medical Van & Diagnostic Health Camps', 'Operating free mobile health clinics equipped with basic diagnostic equipment, essential medicines, and maternal checkups.', 250000.00, '2026-08-18', '2026-11-30', 'Healthcare', 'Active', 2),
(7, 'Winter Clothes & Blanket Drive for Homeless Families', 'Successfully distributed thermal woollens, jackets, and heavy blankets to 800+ pavement dwellers facing harsh winter waves.', 100000.00, '2026-08-01', '2026-08-31', 'Community Care', 'Completed', 2);

-- ==========================================================
-- SevaConnect Database Schema V1.3 (NGO Operations)
-- ==========================================================

ALTER TABLE users MODIFY COLUMN role ENUM('Donor', 'Admin', 'Volunteer') NOT NULL DEFAULT 'Donor';

CREATE TABLE IF NOT EXISTS volunteer_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  skills VARCHAR(255),
  availability VARCHAR(255),
  status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

-- Initial Seed Inventory Items
INSERT IGNORE INTO inventory_items (id, name, category, unit, quantity_available, quantity_distributed, low_stock_threshold) VALUES
(1, 'Family Emergency Grain & Ration Kit (15kg)', 'Food & Nutrition', 'Kits', 120.00, 45.00, 30.00),
(2, 'Thermal Winter Woollen Blankets', 'Winter Relief', 'Pieces', 85.00, 150.00, 25.00),
(3, 'Community Medical First-Aid Kit', 'Medical & Health', 'Boxes', 40.00, 15.00, 15.00),
(4, 'Sanitary Hygiene & Soap Packs', 'Hygiene & Water', 'Packs', 18.00, 95.00, 20.00),
(5, 'Primary School Remedial Study Kit', 'Education', 'Sets', 60.00, 35.00, 15.00);

-- Initial Seed Admin & Volunteer Users (Password: Password123)
INSERT IGNORE INTO users (id, name, email, phone, password, role) VALUES
(2, 'Jia Admin', 'admin@sevaconnect.org', '+91 9123456780', '$2a$10$Yj1rE5YSlerLKIwS1IbBH.ujIfZ8OpnAiBMjRMi./pBvcVjd1J0Te', 'Admin'),
(22, 'Sakshi Patel', 'volunteer@gmail.com', '9876543299', '$2a$10$Yj1rE5YSlerLKIwS1IbBH.ujIfZ8OpnAiBMjRMi./pBvcVjd1J0Te', 'Volunteer'),
(23, 'Sanjana Sharma', 'sanjana.volunteer@email.com', '9823456711', '$2a$10$Yj1rE5YSlerLKIwS1IbBH.ujIfZ8OpnAiBMjRMi./pBvcVjd1J0Te', 'Volunteer'),
(24, 'Shreeya Mehta', 'shreeya.volunteer@email.com', '9812345622', '$2a$10$Yj1rE5YSlerLKIwS1IbBH.ujIfZ8OpnAiBMjRMi./pBvcVjd1J0Te', 'Volunteer'),
(25, 'Ananya Roy', 'ananya.volunteer@email.com', '9834567833', '$2a$10$Yj1rE5YSlerLKIwS1IbBH.ujIfZ8OpnAiBMjRMi./pBvcVjd1J0Te', 'Volunteer'),
(26, 'Vikram Joshi', 'vikram.volunteer@email.com', '9845678944', '$2a$10$Yj1rE5YSlerLKIwS1IbBH.ujIfZ8OpnAiBMjRMi./pBvcVjd1J0Te', 'Volunteer');

-- Initial Seed Volunteer Profiles
INSERT IGNORE INTO volunteer_profiles (id, user_id, skills, availability, status) VALUES
(1, 22, 'Emergency First Aid, Food Distribution, Vehicle Logistics', 'Weekends & Evenings', 'Active'),
(2, 23, 'Medical First Aid, Health Checkups, Nutrition Guidance', 'Full-Time (Emergency On-Call)', 'Active'),
(3, 24, 'Education & Teaching, Youth Mentoring, Digital Literacy', 'Weekdays (Afternoons)', 'Active'),
(4, 25, 'Field Coordination, Beneficiary Verification, Community Liaison', 'Flexible / Shift-based', 'Active'),
(5, 26, 'Heavy Transport, Warehouse Inventory, Emergency Logistics', 'Weekends & Emergency Calls', 'Active');

-- ==========================================================
-- SevaConnect Database Schema V2.1 (Smart Operations)
-- ==========================================================

-- Volunteer task tracking additions
ALTER TABLE assistance_requests
  ADD COLUMN priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium' AFTER urgency,
  ADD COLUMN deadline DATE NULL AFTER priority;

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

-- ==========================================================
-- SevaConnect Database Schema V2.2 (Reports + Analytics)
-- ==========================================================
-- Read-optimized performance indexes for temporal and composite reporting aggregations
ALTER TABLE donations ADD INDEX idx_donations_created_at (created_at);
ALTER TABLE assistance_requests ADD INDEX idx_requests_created_at (created_at);
ALTER TABLE resource_allocations ADD INDEX idx_allocations_created_at (created_at);

-- ==========================================================
-- SevaConnect Database Schema V2.3 (Feedback, Reviews & Timeline)
-- ==========================================================

-- 1. Internal Feedback and Reviews Table
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

-- 2. Granular Donation Status Transitions Audit Log
CREATE TABLE IF NOT EXISTS donation_status_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  donation_id INT NOT NULL,
  status ENUM('Pending Verification', 'Verified', 'Rejected', 'Completed') NOT NULL,
  changed_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (donation_id) REFERENCES donations(id),
  FOREIGN KEY (changed_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Chatbot Interaction Logs (V3.1 Optional Debugging / QA Audit)
CREATE TABLE IF NOT EXISTS chatbot_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- SevaConnect Database Schema V3.2 (Advanced Enhancements)
-- ==========================================================

-- 1. Volunteer Points & Gamification Ledger
CREATE TABLE IF NOT EXISTS volunteer_points (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  total_points INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

-- 2. Badges & Recognition
CREATE TABLE IF NOT EXISTS badges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255) NOT NULL,
  icon VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

-- Seed Default Recognition Badges
INSERT IGNORE INTO badges (id, name, description, icon) VALUES
(1, 'First Steps', 'Completed your first community assistance delivery task.', 'award'),
(2, 'Dedicated Helper', 'Successfully fulfilled 5 relief distribution tasks.', 'shield-check'),
(3, 'Community Champion', 'Completed 10 or more community relief delivery tasks.', 'trophy'),
(4, 'Priority Hero', 'Completed 3 or more High-priority emergency relief missions.', 'flame'),
(5, 'Centurion', 'Earned over 250 volunteer service points.', 'zap'),
(6, 'Legendary Volunteer', 'Reached over 500 volunteer service points.', 'crown');

-- 3. Advanced Notification Preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  notification_type VARCHAR(50) NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE KEY unique_user_pref (user_id, notification_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Immutable Administrative Audit Log
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

-- 5. User Account Soft-Disable Status
ALTER TABLE users ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;








