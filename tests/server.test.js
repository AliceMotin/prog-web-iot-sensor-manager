const request = require("supertest");
const server = require("../src/server");
const { MongoClient } = require("mongodb");

describe("POST /cadastro", () => {
  //let connection;
  var db;
  var clientes;
  var client;

  // Conecta ao banco antes de TODOS os testes
  beforeAll(async () => {
    client = new MongoClient("mongodb://127.0.0.1:27017");
    await client.connect();
    db = await client.db("PESSOAS");
    clientes = await db.collection("clientes");
  });

  // Fecha a conexão após TODOS os testes
  afterAll(async () => {
    if (client) {
      await client.close();
    }
  });

  it("deve salvar o usuário no MongoDB ao enviar dados válidos", async () => {
    const novoUsuario = {
      nome: "Astro",
      email: "astro@teste.com",
      senha: "123",
    };

    const response = await request(server).post("/cadastro").send(novoUsuario);

    expect(response.status).toBe(201);
    //expect(response.body).toHaveProperty("_id"); // O Mongo gera o _id automaticamente
  });
});
