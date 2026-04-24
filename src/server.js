var express = require("express");
var app = express();

const { MongoClient } = require("mongodb");

var db;
var clientes;
var client;

async function conecta() {
  client = new MongoClient("mongodb://127.0.0.1:27017");
  await client.connect();
  db = await client.db("PESSOAS");
  clientes = await db.collection("clientes");
  console.log("conectado no mongoDB");
}

app.use(express.json());
app.use(express.static(__dirname + "/public"));

//usar express para servir as páginas
//app.use(express.static("/public"));
//app.get("/", function (request, response) {});

app.post("/cadastro", async function (req, res) {
  let { nome, email, senha } = req.body;
  let registro = {};
  registro.nome = nome;
  registro.email = email;
  registro.senha = senha;

  await clientes.insertOne(registro);
  res
    .status(201)
    .send("O usuário foi criado com sucesso, pode prosseguir para o login");
});

app.get(/^(.+)$/, function (req, res) {
  try {
    res.send("A pagina que vc busca nao existe");
  } catch (e) {
    res.end();
  }
});

conecta();

app.listen(10000, function () {
  console.log("SERVIDOR WEB na porta 10000");
});

module.exports = app;
