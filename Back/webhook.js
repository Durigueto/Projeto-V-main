const express = require("express");
const database = require("./Database");
const axios = require("axios");
const webhook = express.Router();

const WEBHOOK_RETURN_URL = "http://localhost:3000/responseWebhook/receber";

const API_ANALISAR_URL = "http://localhost:3000/feedback/analisar";

webhook.get("/test", (req, res) => {
  console.log("✅ Rota de teste do Webhook acessada.");
  res.status(200).json({ status: "Webhook ativo" });
});

// ------------------- Rota principal de avaliação -------------------
// POST /api/webhook/avaliacao
webhook.post("/avaliacao", async (req, res) => {

  const {idTicket, dados } = req.body;
  console.log("📩 Webhook /avaliacao recebido. Dados:", req.body);

  // 1️ Validação de campos essenciais
  if ( idTicket === undefined || dados === undefined ) {
    console.error("Validação falhou: Campo ausente.");
    return res.status(400).json({
      status: "error",
      mensagem: "Campo 'dados' obrigatório ausente no corpo da requisição."
    });
  }

  let analiseResultado;
  try {
    // 2️ Chamada à API externa para análise
    console.log(`\n--- Passo 2: Chamando API externa em ${API_ANALISAR_URL} ---`);
    
    const texto = dados

    // Faz a requisição POST para a API /analisar
    const response = await axios.post(API_ANALISAR_URL, { texto });
    
    analiseResultado = response.data;
    
    console.log("✅ Resposta da API /analisar recebida com sucesso.");
    console.log("Dados da Análise:", analiseResultado);
    console.log("---------------------------------------------------\n");

  } catch (error) {
    console.error(`Erro ao chamar a API ${API_ANALISAR_URL}:`, error.message);
    // Retorna erro 500 e ENCERRA a requisição
    return res.status(500).json({
        status: "error",
        mensagem: `Falha ao processar a análise na API externa: ${error.message}`
    });
  }

  // 3️ Montar objeto para inserção no banco de dados
  const analiseResponse = {
    textoAnalisado: dados,
    respostaAnalise: analiseResultado.sentimento,
    resumoAnalise: analiseResultado.explicacao,
    idTicket: idTicket
  };

  console.log("Enviando isso pro BD", analiseResponse);
  
  try {
    // Await para garantir que a inserção termine antes de responder
    const data = await database.insert(analiseResponse).into("atendimento");
    
      if (WEBHOOK_RETURN_URL) {
    try {
      console.log(`📤 Enviando POST de retorno para: ${WEBHOOK_RETURN_URL}`);
      await axios.post(WEBHOOK_RETURN_URL, analiseResponse);
      console.log("✅ POST de retorno enviado com sucesso.");
    } catch (error) {
      console.error(`Erro ao enviar POST de retorno para ${WEBHOOK_RETURN_URL}:`, error.message);
    }
  } else {
    console.warn("WEBHOOK_RETURN_URL não configurada. POST de retorno ignorado.");
  }

  res.status(200).json(analiseResponse);
  } catch (err) {
    console.error("Erro ao inserir no banco de dados:", err);
    
    return res.status(500).json({ 
      mensagem: "Erro ao salvar no banco de dados após a análise.", 
      erro: err.message 
    });
  }
});

module.exports = webhook;
