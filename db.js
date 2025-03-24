require("dotenv").config(); // Para ler o .env
const { Pool } = require("pg"); // Requer o módulo 'pg' para trabalhar com PostgreSQL

// Criação da instância do Pool usando a URL do banco do .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Usando a URL de conexão do .env
  ssl: {
    rejectUnauthorized: false, // Aceitar a conexão segura
  },
});

// Função para verificar a conexão com o banco de dados
pool
  .connect()
  .then(() => console.log("Conectado ao banco de dados!"))
  .catch(err => console.error("Erro ao conectar ao banco de dados", err));

module.exports = pool; // Exporta o pool de conexão para ser usado em outros arquivos
