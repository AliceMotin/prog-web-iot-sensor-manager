# Sistema de Gerenciamento de Dispositivos IoT

Trabalho desenvolvido para a disciplina de **Programação Web** da Universidade Federal de Santa Catarina (UFSC) - Campus Araranguá.

## Sobre o Projeto

O sistema consiste em uma plataforma web de gerenciamento de dispositivos sensores voltada para a Internet das Coisas (IoT). A aplicação permite que clientes se cadastrem, gerenciem seus sensores e visualizem em tempo real os dados enviados por eles. O projeto também conta com simuladores em Node.js para representar os dispositivos em campo.

## Funcionalidades

### Painel do Cliente (Aplicação Web)
* **Autenticação:** Cadastro e login de usuários com email e senha.
* **Gerenciamento de Sensores:** Cadastro de novos sensores com geração automática de `DeviceID` e `DevicePWD`, edição de apelidos e remoção de dispositivos.
* **Monitoramento:** Listagem de todos os sensores cadastrados e visualização do último valor enviado por cada um.

### Simulador de Dispositivos (Node.js)
* Simulação de múltiplos sensores rodando via terminal.
* Autenticação e envio periódico de dados simulados via requisições HTTP POST (`fetch`) utilizando o `DeviceID` e `DevicePWD`.

## Tecnologias Utilizadas

* **Servidor / API REST:** Node.js, Express
* **Banco de Dados:** MongoDB
* **Front-end:** HTML, CSS e JavaScript
* **Simulador:** Node.js (`fetch` nativo)

## Como Executar o Projeto

### Pré-requisitos
* Node.js instalado na máquina.

### 1. Clonar o repositório
```bash
git clone [https://github.com/AliceMotin/prog-web-iot-sensor-manager.git](https://github.com/AliceMotin/prog-web-iot-sensor-manager.git)
cd prog-web-iot-sensor-manager
```
### 2. Configurar e Rodar o Servidor
```bash
cd server
npm install
npm start
```
### 3. Executar o Simulador de Sensores
```bash
cd ../simulator
node index.js <DeviceID> <DevicePWD>
```
## 👩‍💻 **Desenvolvido por:**  
| [<img loading="lazy" src="https://avatars.githubusercontent.com/u/112569754?v=4" width=115><br><sub>Alice Motin</sub>](https://github.com/AliceMotin) | 
| :---: |
