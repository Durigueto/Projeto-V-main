const express = require("express");
const jwt = require("jsonwebtoken"); 
const ctlrUsuario = express.Router();

const databese = require("../Database");

//Criar um novo formulário
ctlrUsuario.post('/novo-form', (req, res) => {
  const { titulo, DataHora } = req.body;
  const agora = new Date();

  if (!titulo) {
    return res.status(400).json({ mensagem: "Título é obrigatório" });
  }

  const dados = {
    Titulo: titulo,
    DataHora: agora || DataHora, // Se não for passado, pega a data atual
    // Usuario: req.loggedUser.id // O ID do usuário logado
    IdUser: req.loggedUser.id
  };

  databese.insert(dados).into("formulario")
    .then(data => {
      return res.status(201).json({ mensagem: "Formulário criado com sucesso", id: data[0] });
    })
    .catch(err => {
      return res.status(500).json({ mensagem: err });
    });
});

ctlrUsuario.post('/logout', (req, res) => {
  // O front precisa retirar o token armazenado na localstore.
return res.status(200).json({ mensagem: `Logout realizado com sucesso` });
});


ctlrUsuario.get('/home', (req, res) =>{
  databese.select("*").table("formulario")
  .then(data => {
    return res.status(201).json({Formularios : data});
  })
  .catch(err => {
    return res.status(500).json({mensagem :err});
  })
})

// rota para trazer um formulário específico
ctlrUsuario.get('/formulario/:id', (req, res) => {
  const id = req.params.id;
  databese.select("*").table("formulario")
    .where({ idForm: id })
    .then(data => {
      if (data.length > 0) {
        return res.status(200).json({ Formulario: data[0] });
      } else {
        return res.status(404).json({ mensagem: "Formulário não encontrado" });
      }
    })
    .catch(err => {
      return res.status(500).json({ mensagem: err });
    });
});

ctlrUsuario.get('/formlario/:texto', (req, res) => {
  const { texto } = req.params.texto; 
  if (!texto) {
    return res.status(400).json({ mensagem: "Texto é obrigatório" });
  }
  databese.select("*").table("formulario")
    .whereRaw('Titulo LIKE ?', [`%${texto}%`])
    .then(data => {
      if (data.length > 0) {
        return res.status(200).json({ Formulario: data });
      } else {
        return res.status(404).json({ mensagem: "Formulário não encontrado" });
      }
    })
    .catch(err => {
      return res.status(500).json({ mensagem: err });
    });
} )

  module.exports = ctlrUsuario