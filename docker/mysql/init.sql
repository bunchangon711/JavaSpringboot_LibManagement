-- Initialize the library database with some basic settings
CREATE DATABASE IF NOT EXISTS librarydb;

USE librarydb;

-- Set character set and collation
ALTER DATABASE librarydb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user with proper permissions (if not exists)
-- Use mysql_native_password for better compatibility with JDBC drivers
CREATE USER IF NOT EXISTS 'libuser'@'%' IDENTIFIED WITH mysql_native_password BY 'libpassword';
GRANT ALL PRIVILEGES ON librarydb.* TO 'libuser'@'%';
FLUSH PRIVILEGES;

-- Optional: Create some initial configuration tables
-- (Your application will create the actual tables via JPA/Hibernate)
