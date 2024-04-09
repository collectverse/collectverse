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
            `CREATE TABLE IF NOT EXISTS users (
        id int(11) NOT NULL AUTO_INCREMENT,
        name varchar(40) DEFAULT NULL,
        email varchar(80) DEFAULT NULL,
        password varchar(255) DEFAULT NULL,
        perfil varchar(120) DEFAULT 'default.png',
        banner varchar(120) DEFAULT 'default.png',
        biography varchar(80) DEFAULT 'Usuário sem biografia.',
        pass tinyint(1) DEFAULT 0,
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
        createdAt datetime NOT NULL,
        updatedAt datetime NOT NULL,
        UserId int(11) DEFAULT NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (UserId) REFERENCES users(id)
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

            `
            INSERT INTO shop (palette, name, description, rarity, price, path, onwer, createdAt, updatedAt) 
        VALUES 
        ('["#4B83F2", "#F0F1F2", "#EAF2AE", "#D98452"]' ,'Amizade caotíca', 'Conhecendo pessoas, uma experiência verdadeiramente incrível! Em um mundo cada vez mais conectado digitalmente, descobrir novos perfis e interagir com diferentes personalidades é uma aventura única e enriquecedora. A cada usuário que conhecemos, abrimos as portas para novas ideias, perspectivas e oportunidades de aprendizado. Portanto, vamos explorar, conectar e celebrar a diversidade de pessoas que tornam nossa comunidade tão vibrante e especial. Juntos, estamos construindo laços que transcendem fronteiras e enriquecem nossas vidas de maneiras inesperadas e emocionantes.', 'exceptional', 0.000, '0001.glb', 'Seafoam', NOW(), NOW()),
        ('["#8CA62E", "#F2913D", "#F2441D", "#F2F2F2"]' ,'Sociactus', 'Sociactus tem um temor profundo do mundo lá fora, mas está pronto para se aventurar em sua jornada. Ele procura um parceiro para ajudá-lo a explorar e enfrentar seus medos juntos. Você está pronto para ser esse parceiro?', "legendary", 1200.00, '0002.glb', 'felipegall', NOW(), NOW());
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

// // Chama a função para criar o banco de dados e tabelas ao inicializar

createSchema();