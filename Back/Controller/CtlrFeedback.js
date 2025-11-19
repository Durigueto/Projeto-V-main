require('dotenv').config();

const express = require("express");
const jwt = require("jsonwebtoken");
const ctlrFeedback = express.Router();

const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

const database = require("../Database");

ctlrFeedback.post("/analisar", async (req, res) => {
    try {
        const { texto } = req.body;

        if (!texto) {
            return res.status(400).json({ erro: "Envie o campo 'texto' no corpo da requisição." });
        }

        const sentimentos = [
            "alegre",
            "satisfeito",
            "neutro",
            "insatisfeito",
            "bravo",
            "triste",
            "confuso",
            "entusiasmado",
            "decepcionado"
        ].join(', ');

        const prompt = `
      Analise o sentimento do seguinte texto:
      "${texto}"

      Classifique o sentimento do texto escolhendo o termo mais adequado da seguinte lista: ${sentimentos}.
      
      Além da classificação, explique brevemente o motivo da escolha.
      
      Retorne o resultado **apenas** no formato JSON, sem nenhum texto adicional, assim:
      {
        "sentimento": "um dos termos da lista acima",
        "explicacao": "breve descrição do motivo"
      }
    `;

        // Assumindo que 'model' e 'generateContent' estão configurados corretamente
        const result = await model.generateContent(prompt);
        const response = result.response.text();
        
        // Limpeza da resposta para garantir que seja um JSON puro
        const cleanResponse = response
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

        res.json(JSON.parse(cleanResponse));
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao processar a requisição." });
    }
});

ctlrFeedback.get('/resposta', async (req, res) => {
    const { texto, status, avaliacao } = req.query; // Usar query parameters

    // Verifica se pelo menos um critério foi fornecido
    if (!texto && !status && !avaliacao) {
        return res.status(400).json({ mensagem: "Pelo menos um critério de busca deve ser fornecido (texto, status ou avaliação)." });
    }

    try {
        // Inicia a query
        let query = databese.select("*").from("resposta");

        // Adiciona filtros condicionalmente
        if (texto && typeof texto === 'string' && texto.trim() !== '') {
            query = query.whereRaw('FeedBack LIKE ?', [`%${texto}%`]);
        }

        if (status && typeof status === 'string') {
            query = query.where({ Status: status });
        }

        if (avaliacao && !isNaN(avaliacao)) {
            query = query.where({ Avaliacao: avaliacao });
        }

        // Executa a query
        const data = await query;

        // Verifica se há resultados
        if (data.length === 0) {
            return res.status(404).json({ mensagem: "Nenhuma resposta encontrada para os critérios fornecidos." });
        }

        // Retorna os resultados
        res.status(200).json({ data });
    } catch (err) {
        console.error("Erro ao buscar respostas:", err);
        res.status(500).json({ mensagem: "Erro interno no servidor." });
    }
});

ctlrFeedback.get('/visualizar/:id', async (req, res) => {
  let id = req.params.id;

  if (isNaN(id)) {
    res.status(400).json({ mensagem: "Id não pode ser nula" });
  } else {
    database.select("*").from("resposta")
      .where({ Pergunta: id })
      .then(data => {
        res.status(200).json({ data });
      }).catch(err => {
        res.status(404).json({ err });
      }
      )
  }

})

ctlrFeedback.get('/visualizar_Avaliacao/:avaliacao', async (req, res) => {
  const avaliacao = req.params.avaliacao;

  if (!avaliacao || typeof avaliacao !== 'string') {
    return res.status(400).json({ mensagem: "Avaliacao inválida" });
  }
''
  try {
    const data = await database
      .select('r.*')
      .from('resposta as r')
      .innerJoin('pergunta as p', 'r.Pergunta', 'p.idPergunta')
      .innerJoin('formulario as f', 'p.IdForm', 'f.IdForm')
      .where({
        'f.IdUser': req.loggedUser.id,
        'r.Avaliacao': avaliacao
      });

    res.status(200).json({ Respostas: data });
  } catch (err) {
    console.error("Erro ao buscar respostas:", err);
    res.status(500).json({ mensagem: "Erro ao buscar respostas.", erro: err });
  }
});


ctlrFeedback.put('/atualizar/:id', async (req, res) => {
  const id = req.params.id;
  const { Avaliacao, Status } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ mensagem: "Id inválido" });
  }

  let camposParaAtualizar = {};

  camposParaAtualizar.Avaliacao = (Avaliacao && Avaliacao.trim() !== "") ? Avaliacao : camposParaAtualizar.Avaliacao;

  // Operador ternário ele verifica se o valor é diferente de nulo ou vazio, se sim ele atribui o valor, se não ele mantém o valor atual.
  camposParaAtualizar.Status = (Status && Status.trim() !== "") ? Status : camposParaAtualizar.Status;

  if (Object.keys(camposParaAtualizar).length > 0) {
    database("resposta")
      .where({ idResposta: id })
      .update(camposParaAtualizar)
      .then(data => {
        if (data) {
          res.status(200).json({ mensagem: "Atualização realizada com sucesso!", data });
        } else {
          res.status(404).json({ mensagem: "Registro não encontrado." });
        }
      })
      .catch(err => {
        visua
        res.status(500).json({ mensagem: "Erro ao atualizar os dados.", erro: err });
      });
  } else {
    res.status(400).json({ mensagem: "Nenhum campo válido para atualizar." });
  }
});

module.exports = ctlrFeedback;