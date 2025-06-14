require('dotenv').config();

const express = require('express');
const cors = require("cors");
const databese = require("./Database");

const app = express();
const router = require("./router");

// Middleware para parsing de JSON e dados de formulários
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS
app.use(cors());

// Middleware para logar TODAS as requisições
app.use((req, res, next) => {
  console.log(`Recebida requisição: ${req.method} ${req.url}`);
  next();
});

// Sirva arquivos estáticos
app.use(express.static('Public'));

// Rotas API
app.use("/", router);

// Middleware para capturar rota não encontrada
app.use((req, res) => {
  console.log(`Rota não encontrada: ${req.method} ${req.url}`);
  res.status(404).send('Rota não encontrada');
});

app.listen(process.env.PORT, () => {
  console.log(`Servidor rodando em http://localhost:${process.env.PORT}`);
});
