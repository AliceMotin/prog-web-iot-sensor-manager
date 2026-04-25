const request = require("supertest");
const server = require("../src/server");
const { MongoClient } = require("mongodb");

describe("testes", () => {
  var db;
  var clientes;
  var client;

  beforeAll(async () => {
    client = new MongoClient("mongodb://127.0.0.1:27017");
    await client.connect();
    db = await client.db("PESSOAS");
    clientes = await db.collection("clientes");
  });

  afterAll(async () => {
    if (client) {
      await client.close();
    }
  });

  it.only("deve salvar o usuário no MongoDB ao enviar dados válidos", async () => {
    const novoUsuario = {
      nome: "Astro",
      email: "astro@teste.com",
      senha: "123",
    };

    const response = await request(server).post("/cadastro").send(novoUsuario);

    expect(response.status).toBe(201);
  });

  it("deve buscar o email e a senha do usuário no BD - válido", async () => {
    const usuarioLoginOK = {
      email: "astro@teste.com",
      senha: "123",
    };

    const response = await request(server).post("/login").send(usuarioLoginOK);

    expect(response.status).toBe(200);
  });

  it("deve buscar o email e a senha do usuário no BD - inválido", async () => {
    const usuarioLogin = {
      email: "teste@invalido.com",
      senha: "1223",
    };

    const response = await request(server).post("/login").send(usuarioLogin);

    expect(response.status).toBe(401);
  });

  it.only("deve gerar DeviceID e DevicePWD ao cadastrar um novo sensor", async () => {
    const novoSensor = {
      email: "astro@teste.com",
      apelido: "sensor1",
      unidade: "Celsius",
    };

    const response = await request(server)
      .post("/dispositivos")
      .send(novoSensor);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("deviceID");
    expect(response.body).toHaveProperty("devicePWD");
  });
});
