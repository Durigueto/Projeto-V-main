const express = require("express");
const router = express.Router();
const { authenticateToken } = require("./authMiddleware");

// Importando controllers
const User = require("./Controller/CtlrUsuario");
const Quest = require("./Controller/CtlrPergunta");
const Resp = require("./Controller/CtlrFeedback");
const CtlrPublic = require("./Controller/CtlrPublic");

// Rotas públicas (sem autenticação)
router.use("/publica", CtlrPublic);

// Rotas protegidas (com autenticação via middleware)
router.use("/pergunta", authenticateToken, Quest);
router.use("/user",authenticateToken, User);
router.use("/feedback", authenticateToken, Resp);

module.exports = router;
