require('dotenv').config();

const express = require("express");
const jwt = require("jsonwebtoken");
const ctlrFeedback = express.Router();
const axios = require('axios');

const databese = require("../Database");

function interpretarEstrelas(label) {
  switch (label) {
    case '1 star':
      return 'Muito negativo';
    case '2 stars':
      return 'Negativo';
    case '3 stars':
      return 'Neutro';
    case '4 stars':
      return 'Positivo';
    case '5 stars':
      return 'Muito positivo';
    default:
      return 'Desconhecido';
  }
}

ctlrFeedback.post('/sentimento', async (req, res) => {
  const { texto } = req.body;

  if (!texto) {
    return res.status(400).json({ erro: 'Campo "texto" é obrigatório.' });
  }

  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/nlptown/bert-base-multilingual-uncased-sentiment',
      { inputs: texto },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        },
      }
    );
    console.log(texto)
    console.log(response.data); // Log para verificar a resposta da API

    const resultado = response.data[0]; // Lista de sentimentos
    const maisProvavel = resultado.reduce((a, b) => (a.score > b.score ? a : b));
    console.log(maisProvavel.label);//pega o sentimento por estrela(5 muito bom, 4 bom, 3 neutro, 2 ruim, 1 muito ruim)

    res.json({
      texto,
      sentimento: interpretarEstrelas(maisProvavel.label),
      confianca: `${(maisProvavel.score * 100).toFixed(2)}%`,
      detalhes: resultado.map(r => ({
        sentimento: interpretarEstrelas(r.label),
        confianca: `${(r.score * 100).toFixed(2)}%`
      }))
    });
  } catch (error) {
    console.error('Erro na API da Hugging Face:', error.response?.data || error.message);
    res.status(500).json({
      erro: 'Erro ao processar análise de sentimento.',
      detalhes: error.response?.data || error.message,
    });
  }
});


// ctlrFeedback.get('/resposta', async (req, res) => {
//     const { texto, status, avaliacao } = req.query; // Usar query parameters

//     // Verifica se pelo menos um critério foi fornecido
//     if (!texto && !status && !avaliacao) {
//         return res.status(400).json({ mensagem: "Pelo menos um critério de busca deve ser fornecido (texto, status ou avaliação)." });
//     }

//     try {
//         // Inicia a query
//         let query = databese.select("*").from("resposta");

//         // Adiciona filtros condicionalmente
//         if (texto && typeof texto === 'string' && texto.trim() !== '') {
//             query = query.whereRaw('FeedBack LIKE ?', [`%${texto}%`]);
//         }

//         if (status && typeof status === 'string') {
//             query = query.where({ Status: status });
//         }

//         if (avaliacao && !isNaN(avaliacao)) {
//             query = query.where({ Avaliacao: avaliacao });
//         }

//         // Executa a query
//         const data = await query;

//         // Verifica se há resultados
//         if (data.length === 0) {
//             return res.status(404).json({ mensagem: "Nenhuma resposta encontrada para os critérios fornecidos." });
//         }

//         // Retorna os resultados
//         res.status(200).json({ data });
//     } catch (err) {
//         console.error("Erro ao buscar respostas:", err);
//         res.status(500).json({ mensagem: "Erro interno no servidor." });
//     }
// });

ctlrFeedback.get('/visualizar/:id', async (req, res) => {
  let id = req.params.id;

  if (isNaN(id)) {
    res.status(400).json({ mensagem: "Id não pode ser nula" });
  } else {
    databese.select("*").from("resposta")
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
    const data = await databese
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
    databese("resposta")
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