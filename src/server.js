var express = require("express");
var app = express();

const { MongoClient } = require("mongodb");

var db;
var clientes;
var client;
var dispositivos;

async function conecta() {
  client = new MongoClient("mongodb://127.0.0.1:27017");
  await client.connect();
  db = await client.db("PESSOAS");
  clientes = await db.collection("clientes");
  dispositivos = await db.collection("dispositivos");
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

app.post("/login", async function (req, res) {
  let { email, senha } = req.body;
  let registro = {};
  registro.email = email;
  registro.senha = senha;

  const usuario = await clientes.findOne(registro);
  if (usuario) {
    res.status(200).send("O usuário foi achado com sucesso");
  } else {
    res.status(401).send("O usuário não foi achado");
  }
});

const crypto = require("crypto");

app.post("/dispositivos", async function (req, res) {
  let { email, apelido, unidade } = req.body;
  let novoDispositivo = {};
  novoDispositivo.email = email;
  novoDispositivo.apelido = apelido;
  novoDispositivo.unidade = unidade;
  novoDispositivo.deviceID = crypto.randomUUID();
  novoDispositivo.devicePWD = crypto.randomBytes(4).toString("hex");
  novoDispositivo.valor = null;

  await dispositivos.insertOne(novoDispositivo);

  //Atualizar a lista de sensores no documento do usuário
  await db
    .collection("clientes")
    .updateOne(
      { email: email },
      { $push: { dispositivos: novoDispositivo.deviceID } }
    );

  res.status(201).send(novoDispositivo); //-> talvez devolver apenas o device ID e devicePWD para o cliente
  //talvez res.status(201).json(novoDispositivo);
});

//http://localhost:10000/lista/astro@teste.com
app.get("/lista/:email", async function (req, resp) {
  let email = req.params.email;
  let listaDispositivos = await dispositivos.find({ email: email }).toArray();
  resp.status(200).send(listaDispositivos);
});

// app.get(/^(.+)$/, function (req, res) {
//   try {
//     res.send("A pagina que vc busca nao existe");
//   } catch (e) {
//     res.end();
//   }
// });

conecta();

app.listen(10000, function () {
  console.log("SERVIDOR WEB na porta 10000");
});

module.exports = app;
