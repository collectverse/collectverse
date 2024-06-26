// Arquivo index.js
require('dotenv').config();

const connection = require("../schema/connection.js");

const recreateDatabase = true; // Defina como true para recriar o banco de dados e excluir todos os dados

async function createSchema() {
    try {
        // Verifica se deve recriar o banco de dados e excluir todos os dados
        if (recreateDatabase) {
            // Drop no banco de dados se ele existir
            await connection.query(`DROP DATABASE IF EXISTS ${process.env.DB_DATABASE}`);
            // Cria o banco de dados
            await connection.query(`CREATE DATABASE ${process.env.DB_DATABASE}`);
            console.log('Banco de dados recriado com sucesso!');
            // Seleciona o banco de dados
            await connection.query(`USE ${process.env.DB_DATABASE}`);
        } else {
            // Seleciona o banco de dados
            await connection.query(`USE ${process.env.DB_DATABASE}`);
            console.log('Conectado ao banco de dados existente.');
        }

        // Array contendo as queries para criar cada tabela (igual ao exemplo anterior)
        const createTableQueries = [

            `CREATE TABLE IF NOT EXISTS pass (
        id int(11) NOT NULL AUTO_INCREMENT,
        value DECIMAL(6) NOT NULL,
        name VARCHAR(24),
        description TEXT,
        rarity VARCHAR(12),
        path VARCHAR(24) NOT NULL,
        palette TEXT,
        onwer VARCHAR(16),
        createdAt datetime NOT NULL,
        updatedAt datetime NOT NULL,
        PRIMARY KEY (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

            `CREATE TABLE IF NOT EXISTS shop (
        id int(11) NOT NULL AUTO_INCREMENT,
        name VARCHAR(24),
        description TEXT,
        rarity VARCHAR(12),
        price DECIMAL(6,2) NOT NULL,
        path VARCHAR(24) NOT NULL,
        palette TEXT,
        onwer VARCHAR(16),
        createdAt datetime NOT NULL,
        updatedAt datetime NOT NULL,
        PRIMARY KEY (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

            `CREATE TABLE IF NOT EXISTS users (
        id int(11) NOT NULL AUTO_INCREMENT,
        name varchar(40) DEFAULT NULL,
        email varchar(80) DEFAULT NULL,
        password varchar(255) DEFAULT NULL,
        perfil varchar(120) DEFAULT 'default.png',
        banner varchar(120) DEFAULT 'default.png',
        biography varchar(80) DEFAULT 'Usuário sem biografia.',
        points DECIMAL(6, 0) NOT NULL DEFAULT '0.00',
        pass BOOL DEFAULT 0,
        collectible varchar(24) DEFAULT NULL,
        createdAt datetime NOT NULL,
        updatedAt datetime NOT NULL,
        PRIMARY KEY (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

            `CREATE TABLE IF NOT EXISTS follows (
        id int(11) NOT NULL AUTO_INCREMENT,
        UserId int(11) DEFAULT NULL,
        followers TEXT,
        following TEXT,
        createdAt datetime NOT NULL,
        updatedAt datetime NOT NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (UserId) REFERENCES users(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

            `CREATE TABLE IF NOT EXISTS publications (
        id int(11) NOT NULL AUTO_INCREMENT,
        text TEXT NOT NULL,
        image varchar(120) DEFAULT NULL,
        likes INT DEFAULT 0,
        likesByUsersIds TEXT ,
        parentId INT DEFAULT 0,
        createdAt datetime NOT NULL,
        updatedAt datetime NOT NULL,
        UserId int(11) DEFAULT NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (UserId) REFERENCES users(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

            `CREATE TABLE IF NOT EXISTS carts (
        id int(11) NOT NULL AUTO_INCREMENT,
        itemIds TEXT NOT NULL,
        UserId int(11) DEFAULT NULL,
        createdAt datetime NOT NULL,
        updatedAt datetime NOT NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (UserId) REFERENCES users(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

        // type da tabela notify varia entre:
        // response, like e follow

            `CREATE TABLE IF NOT EXISTS notify (
        id int(11) NOT NULL AUTO_INCREMENT,
        UserId int(11) DEFAULT NULL,
        parentId INT NOT NULL,
        ifLiked INT,
        ifCommented INT,
        type VARCHAR(8),
        content TINYTEXT,
        createdAt datetime NOT NULL,
        updatedAt datetime NOT NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (UserId) REFERENCES users(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

        // insert

            `INSERT INTO shop (palette, name, description, rarity, price, path, onwer, createdAt, updatedAt) 
        VALUES 
        ('["#325015", "#5f7e40", "#769556", "#8cac6b", "#dceec9"]' ,'Sociactus', 'Sociactus tem um temor profundo do mundo lá fora, mas está pronto para se aventurar em sua jornada. Ele procura um parceiro para ajudá-lo a explorar e enfrentar seus medos juntos. Você está pronto para ser esse parceiro?', "epic", 1200.00, '0001.glb', 'felipegall', NOW(), NOW()),
        ('["#382f32", "#ffeaf2", "#fcd9e5", "#fbc5d8"]' ,'Expresso milk Shake', 'Não é inegavel que no calor ter um desses só para você seria incrivel.', 'legendary', 1400.000, '0002.glb', 'Eleanore Falck', NOW(), NOW()),
        ('["#F21D56", "#BF265E", "#363859", "#141E26"]' ,'Skullsita', 'Ela está com um humor terrível e pronta para arrasar qualquer coisa em seu caminho! Com olhos faiscantes e um sorriso que só um colecionador destemido ousaria enfrentar', 'exceptional', 2400.000, '0003.glb', 'tofox', NOW(), NOW()),
        ('["#BAABE4", "#9B8DBF", "#242426"]' ,'Kuromi', 'Bem fofinha, não? mas ainda sim tenho medo, ela é misteriosa.', "rare", 800.00, '0004.glb', 'Kuromi', NOW(), NOW())
        
        `,

        `INSERT INTO pass (value, name, description, rarity, path, palette, onwer, createdAt, updatedAt) 
        VALUES (5600, 'Não caindo, está bom', 'Voa e voa...', 'exceptional', '0005.glb', '["#54728C", "#D0F2F2", "#C59368", "#FFCE72"]', 'AntijnvanderGun', NOW(), NOW())
        `

        ];

        // Executa cada query para criar as tabelas
        for (let query of createTableQueries) {
            await connection.query(query);
        }

        console.log('Tabelas criadas com sucesso!');
    } catch (error) {
        console.error('Erro ao criar banco de dados e tabelas:', error);
    } finally {
        await connection.end();
    }
}

// Chama a função para criar o banco de dados e tabelas ao inicializar

createSchema();