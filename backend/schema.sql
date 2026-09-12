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
  role ENUM('Donor', 'Admin') NOT NULL DEFAULT 'Donor',
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
