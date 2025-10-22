require('dotenv').config();
const jwt = require("jsonwebtoken");

const JWTSecret = process.env.SECRET;

function authenticateToken(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Pega só o token

        if (!token) {
            return res.status(403).json({ mensagem: 'Token não fornecido' });

        }

        jwt.verify(token, JWTSecret, (err, user) => {
            if (err) {
                return res.status(403).json({ mensagem: 'Token inválido' });
            } else {
                req.Token = token;
                req.loggedUser = {
                    id: user.id,
                    nome: user.nome,
                    email: user.email,
                };

            
                next();
            }
        });
    } catch (error) {
        console.error("Erro no middleware de autenticação:", error);
        res.status(500).json({ mensagem: 'Erro interno no servidor' }); // Tratamento de erro inesperado
    }
}

module.exports = {
    authenticateToken,
    JWTSecret
};
