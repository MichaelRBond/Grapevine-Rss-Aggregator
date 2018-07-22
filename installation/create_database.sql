CREATE DATABASE grapevine_rss;
USE grapevine_rss;
CREATE USER 'grapevine'@'localhost' IDENTIFIED BY 'rss';
GRANT ALL PRIVILEGES ON `grapevine_rss`.* TO 'grapevine'@'localhost';
FLUSH PRIVILEGES;
