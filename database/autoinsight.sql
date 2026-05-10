-- ============================================================
-- AutoInsight Database Schema
-- Import this file into phpMyAdmin or run via MySQL CLI:
--   mysql -u root -p < autoinsight.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS autoinsight CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE autoinsight;

-- --------------------------------------------------------
-- 1. Users
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(100)  NOT NULL,
    email        VARCHAR(150)  NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar       VARCHAR(255)  DEFAULT NULL,
    role         ENUM('user', 'admin') DEFAULT 'user',
    created_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 2. Cars catalogue
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS cars (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    brand        VARCHAR(80)   NOT NULL,
    model        VARCHAR(100)  NOT NULL,
    year         YEAR          NOT NULL,
    price_lakh   DECIMAL(6,2)  NOT NULL,
    fuel_type    ENUM('Petrol','Diesel','Electric','Hybrid') NOT NULL,
    seats        TINYINT       NOT NULL DEFAULT 5,
    body_type    ENUM('Sedan','SUV','Hatchback','MUV','Coupe') NOT NULL,
    image_path   VARCHAR(255)  DEFAULT NULL,
    created_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 3. Reviews (user reviews per car)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id      INT UNSIGNED  NOT NULL,
    car_id       INT UNSIGNED  NOT NULL,
    rating       TINYINT       NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title        VARCHAR(200)  NOT NULL,
    body         TEXT          NOT NULL,
    created_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (car_id)  REFERENCES cars(id)  ON DELETE CASCADE
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 4. Tips & Problems posts
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS tips_posts (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id      INT UNSIGNED  NOT NULL,
    type         ENUM('tip','problem') NOT NULL DEFAULT 'tip',
    title        VARCHAR(250)  NOT NULL,
    description  TEXT          NOT NULL,
    tags         VARCHAR(300)  DEFAULT NULL,   -- comma-separated
    votes        INT           NOT NULL DEFAULT 0,
    created_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 5. Tips post votes (prevent duplicate votes)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS tips_votes (
    user_id      INT UNSIGNED  NOT NULL,
    post_id      INT UNSIGNED  NOT NULL,
    vote         TINYINT       NOT NULL DEFAULT 1,  -- 1 up, -1 down
    PRIMARY KEY (user_id, post_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES tips_posts(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 6. Tips & Problems comments
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS tips_comments (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    post_id      INT UNSIGNED  NOT NULL,
    user_id      INT UNSIGNED  NOT NULL,
    comment_text TEXT          NOT NULL,
    created_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES tips_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)      ON DELETE CASCADE
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 7. Community discussions
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS discussions (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id      INT UNSIGNED  NOT NULL,
    category     VARCHAR(80)   NOT NULL DEFAULT 'General Discussion',
    title        VARCHAR(250)  NOT NULL,
    body         TEXT          NOT NULL,
    views        INT UNSIGNED  NOT NULL DEFAULT 0,
    created_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 8. Discussion replies
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS discussion_replies (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    discussion_id   INT UNSIGNED  NOT NULL,
    user_id         INT UNSIGNED  NOT NULL,
    reply_text      TEXT          NOT NULL,
    created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (discussion_id) REFERENCES discussions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)       REFERENCES users(id)       ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- Sample Car Data (matches your existing frontend cards)
-- ============================================================
INSERT INTO cars (brand, model, year, price_lakh, fuel_type, seats, body_type, image_path) VALUES
('Honda',    'City',       2024, 12.0, 'Petrol',  5, 'Sedan',    'Asset/Images/porsche.jpg'),
('Hyundai',  'Creta',      2024, 14.5, 'Diesel',  5, 'SUV',      'Asset/Images/rr.jpg'),
('Maruti',   'Swift',      2023,  8.5, 'Petrol',  5, 'Hatchback','Asset/Images/gwagon.jpg'),
('Tata',     'Nexon',      2024, 11.0, 'Electric',5, 'SUV',      'Asset/Images/audi.jpg'),
('Kia',      'Seltos',     2024, 15.5, 'Petrol',  5, 'SUV',      'Asset/Images/bentley.jpg'),
('Toyota',   'Fortuner',   2023, 35.0, 'Diesel',  7, 'SUV',      'Asset/Images/mercedes.jpg'),
('Mahindra', 'XUV700',     2024, 18.5, 'Diesel',  7, 'SUV',      'Asset/Images/defender.jpg'),
('Volkswagen','Virtus',    2024, 13.5, 'Petrol',  5, 'Sedan',    'Asset/Images/bmw.jpg');
