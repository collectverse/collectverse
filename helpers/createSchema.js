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

            `CREATE TABLE IF NOT EXISTS shop (
        id int(11) NOT NULL AUTO_INCREMENT,
        name VARCHAR(24),
        description TEXT,
        rarity VARCHAR(12),
        price DECIMAL(6,2) NOT NULL,
        path VARCHAR(24) NOT NULL,
        palette TEXT,
        onwer VARCHAR(16),
        forPass BOOL,
        createdAt datetime NOT NULL,
        updatedAt datetime NOT NULL,
        PRIMARY KEY (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

            `CREATE TABLE IF NOT EXISTS pass (
        id int(11) NOT NULL AUTO_INCREMENT,
        value DECIMAL(6) NOT NULL,
        shopId int(11),
        createdAt datetime NOT NULL,
        updatedAt datetime NOT NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (shopId) REFERENCES shop(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

            `CREATE TABLE IF NOT EXISTS tokens (
        id int(11) NOT NULL AUTO_INCREMENT,
        price DECIMAL(6) NOT NULL,
        type VARCHAR(11) DEFAULT 'Complemento',
        title VARCHAR(32) NOT NULL,
        description TEXT,
        image VARCHAR(255),
        gender TEXT,
        resources TEXT,
        quantity INT(5),
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
        perfilBase64 LONGTEXT,
        banner varchar(120) DEFAULT 'default.png',
        bannerBase64 LONGTEXT,
        biography varchar(80) DEFAULT 'Usuário sem biografia.',
        points DECIMAL(6, 0) NOT NULL DEFAULT '0.00',
        pass BOOL DEFAULT 0,
        collectible varchar(24) DEFAULT NULL,
        tutorial BOOL DEFAULT 0,
        stylesForHome INT(1) DEFAULT 1,
        verified BOOLEAN DEFAULT FALSE,
        verificationToken VARCHAR(255),
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
        imageBase64 LONGTEXT,
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

            `CREATE TABLE IF NOT EXISTS challenges (
        id int(11) AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description VARCHAR(255) NOT NULL,
        points DECIMAL(6, 0) NOT NULL DEFAULT 0,
        createdAt datetime NOT NULL,
        updatedAt datetime NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

            `CREATE TABLE challengesForUser (
        id int(11) AUTO_INCREMENT PRIMARY KEY,
        userId INT(11) NOT NULL,
        challengeId INT NOT NULL,
        completionPercentage DECIMAL(5, 2) DEFAULT 0,
        createdAt datetime NOT NULL,
        updatedAt datetime NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (challengeId) REFERENCES challenges(id)
        )`,

        // insert

            `INSERT INTO shop (palette, name, description, rarity, price, path, onwer, forPass, createdAt, updatedAt) 
        VALUES 
        ('["#325015", "#5f7e40", "#769556", "#8cac6b", "#dceec9"]' ,'Sociactus', 'Sociactus tem um temor profundo do mundo lá fora, mas está pronto para se aventurar em sua jornada. Ele procura um parceiro para ajudá-lo a explorar e enfrentar seus medos juntos. Você está pronto para ser esse parceiro?', "epic", 1200.00, '0001.glb', 'felipegall', 0, NOW(), NOW()),
        ('["#382f32", "#ffeaf2", "#fcd9e5", "#fbc5d8"]' ,'Expresso milk Shake', 'Não é inegavel que no calor ter um desses só para você seria incrivel.', 'legendary', 1400.000, '0002.glb', 'Eleanore Falck', 0, NOW(), NOW()),
        ('["#F21D56", "#BF265E", "#363859", "#141E26"]' ,'Skullsita', 'Ela está com um humor terrível e pronta para arrasar qualquer coisa em seu caminho! Com olhos faiscantes e um sorriso que só um colecionador destemido ousaria enfrentar', 'exceptional', 2400.000, '0003.glb', 'tofox', 0, NOW(), NOW()),
        ('["#BAABE4", "#9B8DBF", "#242426"]' ,'Kuromi', 'Bem fofinha, não? mas ainda sim tenho medo, ela é misteriosa.', "rare", 800.00, '0004.glb', 'Kuromi', 1, NOW(), NOW())
        `,

            `INSERT INTO pass (value, shopId, createdAt, updatedAt) 
        VALUES (5600, 4, NOW(), NOW())
        `,

            `INSERT INTO challenges (title, description, points, createdAt, updatedAt) 
        VALUES ('Seguir 5 novas pessoas', 'Siga 5 novos usuários dentro do Collectverse', 550, NOW(), NOW())`,

            `INSERT INTO challenges (title, description, points, createdAt, updatedAt) 
        VALUES ('Comentar em 4 postagens', 'Comente em 4 postagens de usuários', 600, NOW(), NOW())`,

            `INSERT INTO challenges (title, description, points, createdAt, updatedAt) 
        VALUES ('Curtir 10 postagens', 'Dê like em 10 postagens diferentes', 800, NOW(), NOW())`,

            `INSERT INTO challenges (title, description, points, createdAt, updatedAt) 
        VALUES ('Criar uma nova postagem', 'Publique algo novo no seu perfil', 200, NOW(), NOW())`,

            `INSERT INTO challenges (title, description, points, createdAt, updatedAt) 
        VALUES ('Atualizar a foto de perfil', 'Troque sua foto de perfil para uma nova', 150, NOW(), NOW())`,

            `INSERT INTO tokens (price, type, title, description, image, gender, resources, quantity, createdAt, updatedAt) VALUES (19.99, 'Complemento', 'Pacote de 250 versecoins', 'Compre 250 versecoins, a moeda virtual do site, e expanda seu inventário com colecionáveis premium. Use seus versecoins para adquirir itens limitados na loja, aumentar seu status de jogador e desbloquear conteúdo exclusivo para aprimorar seu perfil e participação em eventos!', '250.png', '["Complemento", "Pacote"]', '{"versecoins": 250}' , 250, NOW(), NOW()),
        
        (49.99, 'Pacote', 'Pacote de 700 versecoins', 'Obtenha 700 versecoins, perfeitos para usuários que desejam aproveitar ao máximo a coleção de itens raros. Com esses versecoins, você pode comprar conjuntos completos de colecionáveis, participar de promoções exclusivas e garantir seu lugar entre os melhores jogadores da comunidade!', '700.png', '["Complemento", "Pacote"]', '{"versecoins": 700}' , 700, NOW(), NOW()),
        
        (99.99, 'Pacote', 'Pacote de 1500 versecoins', 'Garanta 1500 versecoins e aproveite uma experiência de compra sem limites! Esta oferta permite que você adquira os itens mais cobiçados da loja, incluindo pacotes temáticos, acessórios exclusivos, e muito mais. Torne-se um colecionador lendário e destaque-se na comunidade!', '1500.png', '["Complemento", "Pacote"]', '{"versecoins": 1500}' , 1500, NOW(), NOW()),
        
        (149.99, 'Complemento', 'Pacote de 3000 versecoins', 'Adquira 3000 versecoins, ideais para quem busca uma experiência completa no site. Use seus versecoins para comprar tudo o que há de melhor e raro: colecionáveis exclusivos, avatares personalizados, passes de temporada e conteúdo adicional! Seja um dos maiores colecionadores do site!', '3000.png', '["Complemento", "Pacote", "Pacote"]', '{"versecoins": 3000}' , 3000, NOW(), NOW());`

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