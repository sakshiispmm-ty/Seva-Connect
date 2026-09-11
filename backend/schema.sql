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

