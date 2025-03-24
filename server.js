require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const admin = require("firebase-admin");

// Configuração do Express
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); // Permite receber JSON no corpo das requisições

// Conectar ao PostgreSQL (Neon)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool
  .connect()
  .then(() => console.log("Banco de dados conectado!"))
  .catch(err => console.error("Erro ao conectar no banco:", err));

// Inicializar Firebase Admin
const serviceAccount = require("./arquivo-firebase.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

console.log("Firebase Admin inicializado com sucesso!");

// Middleware para autenticação
const verificarToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ error: "Token de autenticação não fornecido" });
  }

  try {
    const decodedUser = await admin.auth().verifyIdToken(token);
    req.user = decodedUser;
    next();
  } catch (error) {
    console.error("Erro ao verificar token:", error);
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
};

// Rota de login (verifica token e cadastra usuário se necessário)
app.post("/login", verificarToken, async (req, res) => {
  try {
    const { uid, name, email } = req.user;

    // Verifica se o usuário já existe no banco de dados
    const userExists = await pool.query("SELECT * FROM users WHERE id = $1", [
      uid,
    ]);

    if (userExists.rows.length === 0) {
      await pool.query(
        "INSERT INTO users (id, nome, email) VALUES ($1, $2, $3)",
        [uid, name || "Usuário", email]
      );
    }

    res.status(200).json({ message: "Login bem-sucedido", user: req.user });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
});

// Rota para buscar perfil do usuário
app.get("/perfil", verificarToken, async (req, res) => {
  try {
    const { uid } = req.user;

    const user = await pool.query("SELECT * FROM users WHERE id = $1", [uid]);

    if (user.rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    res.status(200).json(user.rows[0]);
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
