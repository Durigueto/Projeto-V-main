const express = require("express");
const jwt = require("jsonwebtoken");
const ctlrPergunta = express.Router();

const databese = require("../Database")


ctlrPergunta.post("/novo-pergunta/:idForm", (req, res) => {
    const { pergunta, status } = req.body;

    if (!pergunta || pergunta.trim() === "") {
        return res.status(400).json({ mensagem: "Pergunta não pode ser nula" });
    }

    let Dados = {
        Pergunta: pergunta,
        Status: status || 0,
        IdForm: req.params.idForm,
    };

    databese.insert(Dados).into("pergunta")
        .then(data => {
            res.status(201).json({ mensagem: data });
        }).catch(err => {
            res.status(500).json({ mensagem: err });
        });
});


ctlrPergunta.put('/alterar-pergunta/:id', (req, res) => {
    let id = req.params.id;
    let Pergunta = req.body.pergunta;
    let Status = req.body.status;

    let camposParaAtualizar = {};

    camposParaAtualizar.Pergunta = (Pergunta && Pergunta.trim() !== "") ? Pergunta : camposParaAtualizar.Pergunta;

    // Operador ternário ele verifica se o valor é diferente de nulo ou vazio, se sim ele atribui o valor, se não ele mantém o valor atual.
    camposParaAtualizar.Status = (Status && Status.trim() !== "") ? Status : camposParaAtualizar.Status;

    if (Object.keys(camposParaAtualizar).length > 0) {
        databese("pergunta")
            .where({ idPergunta: id })
            .update(camposParaAtualizar)
            .then(data => {
                if (data) {
                    res.status(200).json({ mensagem: "Atualização realizada com sucesso!", data });
                } else {
                    res.status(404).json({ mensagem: "Registro não encontrado." });
                }
            })
            .catch(err => {
                res.status(500).json({ mensagem: "Erro ao atualizar os dados.", erro: err });
            });
    } else {
        res.status(400).json({ mensagem: "Nenhum campo válido para atualizar." });
    }
});


ctlrPergunta.get('/perguntas-form/:id', (req, res) => {
    let id = req.params.id

    if (isNaN(id)) {
        res.status(401).json({ mensagem: "Id do formulário não pode ser nula" })
    } else {
        databese.select("*").table("pergunta")
            .where({ idForm: id })
            .then(data => {
                res.status(201).json({ Perguntas: data });
            })
            .catch(err => {
                res.status(500).json({ mensagem: err });
            })
    }
})

ctlrPergunta.get('/:id', async (req, res) => {
    let id = req.params.id

    if (isNaN(id)) {
        res.status(401).json({ mensagem: "Id pergunta não pode ser nula" })
    } else {
        databese.select("*").from("pergunta")
            .where({ idPergunta: id })
            .then(data => {
                if (data.length === 0) {
                    return res.status(404).json({ mensagem: "Pergunta não encontrada" });
                } else {
                    res.status(200).json({ data });
                }
            })
            .catch(err => {
                res.status(404).json({ err })
            })
    }
})


ctlrPergunta.delete('/deletar-pergunta/:id', (req, res) => {
    let id = req.params.id

    if (isNaN(id)) {
        res.status(401).json({ mensagem: "Id pergunta precisa ser um numero" })
    } else {
        databese.delete("*").from("pergunta")
            .where({ idPergunta: id })
            .then(data => {
                if (data) {
                    res.status(200).json({ mensagem: "Pergunta deletada com sucesso!" , data});
                } else {
                    res.status(404).json({ mensagem: "Pergunta não encontrada" });
                }
            })
            .catch(err => {
                res.status(404).json({ err })
            })
    }
})

module.exports = ctlrPergunta;