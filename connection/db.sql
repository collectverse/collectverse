CREATE DATABASE IF NOT EXISTS collectverse ;
USE collectverse;
CREATE TABLE users 
(
	id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    username VARCHAR(20) NOT NULL,
    email VARCHAR(64) NOT NULL,
    password VARCHAR(32) NOT NULL,
    terms BOOL NOT NULL,
    profileimage VARCHAR(120) DEFAULT 'https://moonvillageassociation.org/wp-content/uploads/2018/06/default-profile-picture1-768x768.jpg',
    profilebanner VARCHAR(120) DEFAULT 'https://th.bing.com/th/id/OIP.vRtnhAoGWqNrlrJkChQ7GQHaEK?pid=ImgDet&rs=1',
    description VARCHAR(65) DEFAULT 'Olá, acabei de entrar no CollectVerse 👋.',
    model CHAR(3) DEFAULT '001',
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);
CREATE TABLE publications
(
	id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    owneruser INT NOT NULL,
    body MEDIUMTEXT NOT NULL,
    attachment VARCHAR(120),
    dateandtime DATETIME NOT NULL,
    FOREIGN KEY (owneruser) REFERENCES users(id)
);