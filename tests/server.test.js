const request = require("supertest");
const server = require("../src/server");
const { MongoClient } = require("mongodb");

describe("testes", () => {
  var db;
  var clientes;
  var client;
  var dispositivos;

  beforeAll(async () => {
    client = new MongoClient("mongodb://127.0.0.1:27017");
    await client.connect();
    db = await client.db("PESSOAS");
    clientes = await db.collection("clientes");
    dispositivos = await db.collection("dispositivos");
  });

  // beforeEach(async () => {
  //   // Isso garante que cada teste rode em um ambiente limpo
  //   await db.collection("dispositivos").deleteMany({});
  //   await db.collection("clientes").deleteMany({});
  // });

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

  it("deve gerar DeviceID e DevicePWD ao cadastrar um novo sensor", async () => {
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

  it("deve listar os dispositivos do cliente", async () => {
    const email = "astro@teste.com";

    const response = await request(server).get(`/lista/${email}`);

    expect(response.status).toBe(200);
  });

  it("deve ser possível editar apelido", async () => {
    const apelidoNovo = "sensorNovo21";
    const email = "astro@teste.com";
    const id = "85c5d1af-c6ca-40ae-bfb1-f39363d3fe4b";
    const response = await request(server)
      .patch(`/edicao/${id}`)
      .send({ apelido: apelidoNovo, email: email });

    expect(response.status).toBe(200);
  });

  it.only("deve ser possível remover dispositivos", async () => {
    const id = "85c5d1af-c6ca-40ae-bfb1-f39363d3fe4b";
    const email = "astro@teste.com";
    const response = await request(server)
      .delete(`/remover/${id}`)
      .send({ email: email });
    expect(response.status).toBe(200);
  });
});
