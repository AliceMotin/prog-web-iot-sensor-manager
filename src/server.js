var express = require("express");
var jwt = require("jsonwebtoken");
var segredo = "kjsjdr3kjdskjsfkjjkq4tfklf";
var app = express();
const path = require("path");

const { MongoClient } = require("mongodb");

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(express.urlencoded({ extended: true })); // support encoded bodies

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

function autenticacao(req, res, next) {
  var token = req.headers["x-access-token"];
  if (!token)
    return res
      .status(401)
      .json({ status: "falha", mmsgessage: "nao veio token" });

  jwt.verify(token, segredo, function (err, decoded) {
    if (err)
      return res.status(401).json({ status: "falha", msg: "token errado" });

    // se tudo estiver ok, salva no request para uso posterior
    req.id = decoded.id;

    next();
  });
}

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

  const resultado = await clientes.insertOne(registro);

  const token = jwt.sign(
    { id: resultado.insertedId.toString(), email: email },
    segredo,
    {
      expiresIn: 1000,
    }
  );

  res.status(201).json({
    status: "sucesso",
    token: token, // O token gerado pelo jwt.sign
  });
});

app.post("/login", autenticacao, async function (req, res) {
  const { ObjectId } = require("mongodb");
  const usuario = await clientes.findOne({ _id: new ObjectId(req.id) });

  if (usuario) {
    res.status(200).json({
      status: "sucesso",
      msg: "Token validado com sucesso",
      usuario: usuario,
    });
  } else {
    res.status(404).json({ status: "falha", msg: "Usuário não existe mais" });
  }
});

// app.post("/login", async function (req, res) {
//   let { email, senha } = req.body;
//   let registro = {};
//   registro.email = email;
//   registro.senha = senha;

//   const usuario = await clientes.findOne(registro);
//   if (usuario) {
//     res.status(200).send("O usuário foi achado com sucesso");
//   } else {
//     res.status(401).send("O usuário não foi achado");
//   }
// });

const crypto = require("crypto");

app.post("/dispositivos", autenticacao, async function (req, res) {
  let { apelido, unidade } = req.body;
  const { ObjectId } = require("mongodb");
  const cliente = await clientes.findOne({ _id: new ObjectId(req.id) });

  //const cliente = await clientes.findOne({ email: email });

  if (!cliente) {
    return res
      .status(403)
      .send("Acesso negado: Não é possível add um sensor, token inválido!");
  }

  let novoDispositivo = {};
  //novoDispositivo.donoID = new ObjectId(req.id);
  novoDispositivo.email = cliente.email;
  novoDispositivo.apelido = apelido;
  novoDispositivo.unidade = unidade;
  novoDispositivo.deviceID = crypto.randomUUID();
  novoDispositivo.devicePWD = crypto.randomBytes(4).toString("hex");
  novoDispositivo.valor = null;

  await dispositivos.insertOne(novoDispositivo);

  //Atualizar a lista de sensores no documento do usuário
  await clientes.updateOne(
    { _id: new ObjectId(req.id) },
    { $push: { dispositivos: novoDispositivo.deviceID } }
  );

  //res.status(201).send(novoDispositivo); //-> talvez devolver apenas o device ID e devicePWD para o cliente
  //talvez res.status(201).json(novoDispositivo);

  res.status(201).json({
    status: "sucesso",
    deviceID: novoDispositivo.deviceID,
    devicePWD: novoDispositivo.devicePWD,
  });
});

//http://localhost:10000/lista/astro@teste.com
app.get("/lista/:email", async function (req, resp) {
  let email = req.params.email;
  let listaDispositivos = await dispositivos.find({ email: email }).toArray();
  resp.status(200).send(listaDispositivos);
});

app.patch("/edicao/:id", async function (req, resp) {
  let id = req.params.id;
  const email = req.body.email;
  const novoApelido = req.body.apelido;

  // 1. Validar permissão: Busca o sensor e checa se o dono é quem diz ser
  const sensor = await dispositivos.findOne({ deviceID: id });

  if (sensor.email !== email) {
    return resp.status(403).send("Acesso negado: Este dispositivo não é seu!");
  }

  await dispositivos.updateOne(
    { deviceID: id },
    { $set: { apelido: novoApelido } }
  );
  resp.status(200).send("Atualizado com sucesso");
});

app.delete("/remover/:id", async function (req, resp) {
  let id = req.params.id;
  const email = req.body.email;

  // 1. Validar permissão: Busca o sensor e checa se o dono é quem diz ser
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

  if (sensor.email !== email) {
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
