const express = require("express");
const router = express.Router();
const { authenticateToken } = require("./authMiddleware");

// Importando controllers
const User = require("./Controller/CtlrUsuario");
const Quest = require("./Controller/CtlrPergunta");
const Resp = require("./Controller/CtlrFeedback");
const CtlrPublic = require("./Controller/CtlrPublic");

const webhookRoutes = require("./webhook");
const responseWebhook = require("./receberWebhook");

// Rotas públicas (sem autenticação)
router.use("/publica", CtlrPublic);
router.use("/webhook", webhookRoutes);
router.use("/responseWebhook", responseWebhook);

// Rotas protegidas (com autenticação via middleware)
router.use("/pergunta", authenticateToken, Quest);
router.use("/user",authenticateToken, User);
router.use("/feedback", Resp);

module.exports = router;
