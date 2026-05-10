-- ============================================================
-- AutoInsight Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS autoinsight CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE autoinsight;

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(100)  NOT NULL,
    email        VARCHAR(150)  NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar       VARCHAR(255)  DEFAULT NULL,
    role         ENUM('user', 'admin') DEFAULT 'user',
    created_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Cars catalogue
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
    is_featured  TINYINT(1)    DEFAULT 0,
    engine       VARCHAR(100)  DEFAULT NULL,
    transmission ENUM('Manual','Automatic') DEFAULT 'Manual',
    mileage      VARCHAR(50)   DEFAULT NULL,
    safety_rating VARCHAR(50)  DEFAULT NULL,
    pros         TEXT          DEFAULT NULL,
    cons         TEXT          DEFAULT NULL,
    description  TEXT          DEFAULT NULL,
    created_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id      INT UNSIGNED  NOT NULL,
    car_id       INT UNSIGNED  DEFAULT NULL,
    car_name     VARCHAR(150)  DEFAULT NULL,
    rating       TINYINT       NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title        VARCHAR(200)  NOT NULL,
    body         TEXT          NOT NULL,
    created_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (car_id)  REFERENCES cars(id)  ON DELETE SET NULL
) ENGINE=InnoDB;

-- 4. Tips & Problems posts
CREATE TABLE IF NOT EXISTS tips_posts (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id      INT UNSIGNED  NOT NULL,
    type         ENUM('tip','problem') NOT NULL DEFAULT 'tip',
    title        VARCHAR(250)  NOT NULL,
    description  TEXT          NOT NULL,
    tags         VARCHAR(300)  DEFAULT NULL,
    votes        INT           NOT NULL DEFAULT 0,
    created_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Tips post votes
CREATE TABLE IF NOT EXISTS tips_votes (
    user_id      INT UNSIGNED  NOT NULL,
    post_id      INT UNSIGNED  NOT NULL,
    vote         TINYINT       NOT NULL DEFAULT 1,
    PRIMARY KEY (user_id, post_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES tips_posts(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Tips & Problems comments
CREATE TABLE IF NOT EXISTS tips_comments (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    post_id      INT UNSIGNED  NOT NULL,
    user_id      INT UNSIGNED  NOT NULL,
    comment_text TEXT          NOT NULL,
    created_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES tips_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)      ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Community discussions
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

-- 8. Discussion replies
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
-- Initial Admin User
-- Password: admin123
-- ============================================================
INSERT INTO users (name, email, password_hash, role) VALUES
('Admin', 'admin@autoinsight.com', '$2y$10$f66/eMOfv/H0YpT.R3lZ5.B6xS6Uv8x3Z.I5/B1iI6O7t8u9wA0B1', 'admin');
-- (The above hash is for password 'admin123')
