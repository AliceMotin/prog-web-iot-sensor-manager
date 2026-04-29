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

const path = require("path");

// Isso garante que o Express encontre a pasta 'public'
// independente de onde você chame o comando 'node' no terminal.
app.use(express.static(path.join(__dirname, "..", "public")));

// app.use(express.json());
// app.use(express.static(__dirname + ".. /public"));

//usar express para servir as páginas
//app.use(express.static("/public"));

app.post("/cadastro", async function (req, res) {
  const { nome, email, senha } = req.body;

  let registro = {};
  registro.nome = nome;
  registro.email = email;
  registro.senha = senha;

  if (!nome) {
    return res.status(403).send("Acesso negado: Insira um Nome");
  }

  if (!email) {
    return res.status(403).send("Acesso negado: Insira um email");
  }

  if (!senha) {
    return res.status(403).send("Acesso negado: Insira uma senha");
  }

  const cliente = await clientes.findOne({ email: email });

  if (cliente) {
    return res
      .status(403)
      .send("Acesso negado: Esse email já foi cadastrado anteriormente!");
  }

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

  const cliente = await clientes.findOne({ email: email });

  if (cliente.email != email) {
    return res
      .status(403)
      .send(
        "Acesso negado: Não é possível add um sensor de um email inválido!"
      );
  }

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
app.get("/lista", async function (req, resp) {
  let email = req.query.email; //req.params apenas para rotas com :
  let listaDispositivos = await dispositivos.find({ email: email }).toArray();
  resp.status(200).send(listaDispositivos);
});

app.patch("/edicao", async function (req, resp) {
  const { id, email, apelido } = req.body;

  const sensor = await dispositivos.findOne({ deviceID: id });

  if (sensor.email !== email) {
    return resp.status(403).send("Acesso negado: Este dispositivo não é seu!");
  }

  await dispositivos.updateOne(
    { deviceID: id },
    { $set: { apelido: apelido } }
  );
  resp.status(200).send("Atualizado com sucesso");
});

app.delete("/remover", async function (req, resp) {
  const { id, email } = req.body;

  const sensor = await dispositivos.findOne({ deviceID: id });

  if (sensor.email !== email) {
    return resp.status(403).send("Acesso negado: Este dispositivo não é seu!");
  }

  await dispositivos.deleteOne({ deviceID: id });

  await clientes.updateOne(
    { dispositivos: id }, // Filtra o cliente que possui esse ID na lista
    { $pull: { dispositivos: id } }
  );
  resp.status(200).send("Dispositivo deletado com sucesso");
});

app.post("/dados", async function (req, resp) {
  let id = req.body.deviceID;
  let pwd = req.body.devicePWD;
  let email = req.body.email;
  let valor = req.body.valor;

  // 1. Validar permissão: Busca o sensor e checa se o dono é quem diz ser
  const sensor = await dispositivos.findOne({ deviceID: id, devicePWD: pwd });

  if (!sensor || sensor.email !== email) {
    return resp.status(403).send("Acesso negado: Este dispositivo não é seu!");
  }

  await dispositivos.updateOne({ deviceID: id }, { $set: { valor: valor } });

  resp.status(200).send("Dado recebido!");
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
