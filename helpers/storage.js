// Configurando o multer para upload de arquivos
const multer = require("multer")

// gera um numero aleatório
function randowNumber() {
    return Math.floor(Math.random() * 100) + Date.now();
}

// Função para validar o tipo de arquivo
const filterTypes = {
    image: (req, file, cb) => {
        cb(null, true);
    },
    perfil: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
        if (req.isPremium) {
            allowedTypes.push("image/gif")
        }
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
            req.flash("msg", "Imagem enviada com sucesso.")
        } else if (file.mimetype == "image/gif") {
            cb(new Error('Formato de imagem suportado apenas para usuários Premium.'));
        } else {
            cb(new Error('Formato de imagem não suportado.'));
        }
    },
    banner: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
        if (req.isPremium) {
            allowedTypes.push("image/gif")
        }
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
            req.flash("msg", "Imagem enviada com sucesso.")
        } else if (file.mimetype == "image/gif") {
            cb(new Error('Formato de imagem suportado apenas para usuários Premium.'));
        } else {
            cb(new Error('Formato de imagem não suportado.'));
        }
    }
}

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         if (file.fieldname === 'perfil') {
//             cb(null, './public/uploads/user/perfils/');
//         } else if (file.fieldname === 'banner') {
//             cb(null, './public/uploads/user/banners/');
//         } else if (file.fieldname === 'image') {
//             cb(null, './public/uploads/publication/images/');
//         } else {
//             cb(new Error('Tipo de imagem desconhecido.'));
//         }
//     },
//     filename: (req, file, cb) => {
//         const uniqueName = `${Date.now()}-${randowNumber()}-${file.originalname}`;
//         cb(null, uniqueName);
//     },
// });

const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.fieldname in filterTypes) {
            filterTypes[file.fieldname](req, file, cb);
        } else {
            cb(new Error('Campo de upload desconhecido.'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

module.exports = upload;