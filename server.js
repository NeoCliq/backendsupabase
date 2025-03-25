require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Rota de login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
});

// Rota de cadastro
app.post("/register", async (req, res) => {
  const { email, password, name, phone } = req.body;

  try {
    // Tentar criar o usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      if (authError.message.includes("duplicate")) {
        // Se for erro de duplicação, logue e faça o login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) return res.status(400).json({ error: error.message });

        return res.json({
          message: "Usuário já existe, login realizado com sucesso!",
          data,
        });
      }
      throw authError; // Caso o erro não seja de duplicação
    }

    const userId = authData.user?.id; // Obtendo o ID do usuário criado no auth

    if (!userId) {
      return res.status(400).json({ error: "Erro ao obter ID do usuário." });
    }

    console.log(`Usuário registrado com ID: ${userId}`);

    // Verificar se o usuário já existe na tabela 'users'
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .single(); // Busca um único usuário com esse ID

    if (checkError) throw checkError;

    // Se o usuário já existe, não insira novamente
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Usuário já registrado na tabela 'users'." });
    }

    // Inserir nome e telefone na tabela 'users' usando o ID do usuário criado no auth
    const { error: dbError } = await supabase
      .from("users")
      .insert([{ id: userId, name, phone, email, created_at: new Date() }]);

    if (dbError) throw dbError;

    res.status(201).json({ message: "Usuário registrado com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
