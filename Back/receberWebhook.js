const express = require("express");
const database = require("./Database");
const webhookResponse = express.Router();

let ultimoDadoRecebido = null;

webhookResponse.post("/receber", (req, res) => {
  console.log("\n✅ Retorno recebido do webhook:");
  console.log(req.body);

  ultimoDadoRecebido = req.body;

  res.status(200).json({
    status: "Recebido com sucesso",
    dados: req.body
  });
});

webhookResponse.get("/ultimo", (req, res) => {

  database.select('*').from('atendimento').orderBy('id', 'desc').then((rows) => {
      res.json(rows);
  }).catch((error) => {
    console.error("Erro ao buscar o último atendimento:", error);
    res.status(500).json({ mensagem: "Erro ao buscar o último atendimento." });
  });
});

// --- Apenas para testar se o servidor está ativo ---
webhookResponse.get("/", (req, res) => {
  res.send("Servidor receptor ativo! Use POST /receber para testar.");
});

module.exports = webhookResponse;