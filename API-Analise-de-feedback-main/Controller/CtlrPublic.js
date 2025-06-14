const express = require("express");
const jwt = require("jsonwebtoken");
const CtlrPublic = express.Router();
const { authenticateToken, JWTSecret } = require("../authMiddleware");

const databese = require("../Database")

CtlrPublic.post('/novo-user', (req, res) => {

  const { nome, email, senha } = req.body;

  if (!nome || !senha || !email) {
    return res.status(400).json({ mensagem: "Todos os campos são obrigatórios" });
  }

  // Verificar se já existe um usuário com esse email
  databese('usuario').where({ Email: email }).then(data => {
    if (data.length > 0) {
      return res.status(409).json({ mensagem: "Email já está em uso." });
    } else {
      let dados = {
        Nome: nome,
        Senha: senha,
        Email: email,
      }

      databese.insert(dados).into("usuario").then(data => {
        res.status(201).json({ mensagem: data });
      }).catch(err => {
        res.status(500).json({ mensagem: err });
      })

    }
  })
})

CtlrPublic.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ mensagem: "Email e senha são obrigatórios" });
  }

  databese
    .select("*").from("usuario")
    .where({ Email: email, Senha: senha })
    .then(data => {
      if (data.length > 0) {

        const usuario = data[0];

        const token = jwt.sign(
          {
            id: usuario.idUsuario,
            nome: usuario.Nome,
            email: usuario.Email
          },
          JWTSecret,
          {
            expiresIn: '1h',
            algorithm: 'HS256'
          }
        );

        return res.status(200).json({ token });
      } else {
        return res.status(401).json({ mensagem: "Credenciais inválidas" });
      }
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ mensagem: "Erro no servidor" });
    });
});


CtlrPublic.post('/novo_feedBack/:pergunta', async (req, res) => {
    const IdPergunta = req.params.pergunta;
    const { resposta, status } = req.body;

    // Validação do parâmetro pergunta
    if (!IdPergunta) {
        return res.status(400).json({ mensagem: "O ID da pergunta é obrigatório." });
    }

    // Validação do corpo da requisição
    if (!resposta || typeof resposta !== 'string' || resposta.trim() === '') {
        return res.status(400).json({ mensagem: "O campo 'resposta' é obrigatório e deve ser uma string válida." });
    }

    try {
        // Verifica se a pergunta existe no banco de dados
        const pergunta = await databese('pergunta')
            .select('*')
            .where({ id: IdPergunta })
            .first();

        if (!pergunta) {
            return res.status(404).json({ mensagem: "A pergunta fornecida não existe." });
        }

        // Dados a serem inseridos
        const Dados = {
            Pergunta: IdPergunta,
            Status: status || "Não avaliado",
            FeedBack: resposta
        };

        // Inserção no banco de dados
        const data = await databese.insert(Dados).into("resposta");

        res.status(201).json({ mensagem: "Resposta criada com sucesso.", id: data[0] });
    } catch (err) {
        console.error("Erro ao criar resposta:", err);
        res.status(500).json({ mensagem: "Erro interno no servidor." });
    }
});



  module.exports = CtlrPublic