const fetch = require("node-fetch");

// Captura de parâmetros: node simulador.js <ID> <PWD>
const deviceID = process.argv[2];
const devicePWD = process.argv[3];
const emailDono = process.argv[4];

if (!deviceID || !devicePWD) {
  console.error("Uso correto: node simulador.js <DeviceID> <DevicePWD>");
  process.exit(1);
}

const URL_API = "http://localhost:10000/dados";

async function enviarDados() {
  // Simulação de valor (ex: temperatura entre 15 e 35)
  const valorSimulado = (Math.random() * 20 + 15).toFixed(2);

  const payload = {
    deviceID: deviceID,
    devicePWD: devicePWD,
    email: emailDono,
    valor: parseFloat(valorSimulado),
  };

  try {
    const response = await fetch(URL_API, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      console.log(
        `[${deviceID}] Enviado: ${valorSimulado} - Status: ${response.status}`
      );
    } else {
      console.error(`Erro no servidor: ${response.status}`);
      console.log(error);
    }
  } catch (error) {
    console.error("Não foi possível conectar ao servidor. Ele está rodando?");
  }
}

// Envia a cada 5 segundos
setInterval(enviarDados, 5000);
console.log(`Simulador rodando para o ID: ${deviceID}...`);
