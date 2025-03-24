// auth.js

// Importar Firebase
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

require("dotenv").config(); // Carrega as variáveis do arquivo .env
// Configuração do Firebase
const firebaseConfig = {
  authDomain: "neocliq-711cd.firebaseapp.com",
  projectId: "neocliq-711cd",
  storageBucket: "neocliq-711cd.firebasestorage.app",
  messagingSenderId: "216525354752",
  appId: "1:216525354752:web:ded201514b57e62a45a5e5",
  measurementId: "G-SJL0W5WV72",
};

const googleApiKey = process.env.GOOGLE_API_KEY;

// Inicializar o Firebase
const app = initializeApp(firebaseConfig);

// Obter a instância do Auth
const auth = getAuth(app);

// Função de login com e-mail e senha
const loginWithEmailPassword = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    //obter o token do firebase após login//
    const token = await user.getIdToken();
    console.log("Token do firebase", token);
    return token; //retorna o token para ser usado no backend
  } catch (error) {
    console.error("Erro ao fazer login:", error);
  }
};

// Função para fazer logout
const logout = async () => {
  try {
    await signOut(auth);
    console.log("Usuário deslogado com sucesso");
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
  }
};

// Verificar o estado de autenticação
onAuthStateChanged(auth, user => {
  if (user) {
    console.log("Usuário logado:", user);
    // Você pode redirecionar para a página principal ou qualquer outra ação
  } else {
    console.log("Usuário não logado");
  }
});

// Exportando as funções para uso em outras partes do seu código
export { loginWithEmailPassword, logout };
