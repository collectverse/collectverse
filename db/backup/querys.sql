CREATE DATABASE collectverse;
USE collectverse;
DROP DATABASE gb3edgse;
CREATE TABLE usuario 
(
	id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    username VARCHAR(20) NOT NULL,
    email VARCHAR(64) NOT NULL,
    password VARCHAR(32) NOT NULL,
    profileimage VARCHAR(120) DEFAULT 'https://moonvillageassociation.org/wp-content/uploads/2018/06/default-profile-picture1-768x768.jpg',
    profilebanner VARCHAR(120) DEFAULT 'https://th.bing.com/th/id/OIP.vRtnhAoGWqNrlrJkChQ7GQHaEK?pid=ImgDet&rs=1',
	description TINYTEXT DEFAULT 'Olá, Acabei de entrar no CollectVerse 👋',
    entrydata DATE NOT NULL,
    model CHAR(3) DEFAULT '001'
);
CREATE TABLE publications
(
	id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    owneruser INT NOT NULL,
    body MEDIUMTEXT NOT NULL,
    attachment VARCHAR(120),
    dateandtime DATETIME NOT NULL,
    FOREIGN KEY (owneruser) REFERENCES usuario(id)
);

RENAME TABLE publicacoes TO publications;
DESCRIBE users;
RENAME TABLE usuario TO users;
ALTER TABLE users 
ADD created_at DATETIME NOT NULL, 
ADD updated_at DATETIME NOT NULL;
ALTER TABLE publications DROP COLUMN dateandtime;
ALTER TABLE publications
ADD created_at DATETIME NOT NULL, 
ADD updated_at DATETIME NOT NULL;
SELECT * FROM users;
ALTER TABLE users DROP COLUMN entrydata;
ALTER TABLE users ADD terms BOOL NOT NULL;
DELETE FROM users WHERE id >= 1;
ALTER TABLE users AUTO_INCREMENT = 1;