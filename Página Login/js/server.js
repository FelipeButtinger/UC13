const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(bodyParser.json());

// Conexão com o banco de dados
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "login",
});

// Habilitando CORS
app.use(cors());

// Segredo para assinar o token
const JWT_SECRET = "seu_segredo_aqui";

// Rota de login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) throw err;

      // Verifica se o usuário existe e se a senha está correta
      if (
        results.length === 0 ||
        !(await bcrypt.compare(password, results[0].password))
      ) {
        return res.status(400).send("Email ou senha inválidos!");
      }

      // Gera o token JWT
      const token = jwt.sign(
        { id: results[0].id, email: results[0].email },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      // Retorna o token ao cliente
      res.json({ token });
    }
  );
});

// Middleware para autenticação de token
const authenticateToken = (req, res, next) => {
  const token =
    req.headers["authorization"] && req.headres["authorization"].split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// alterar
app.put("./user", authenticateToken, async (req, res) => {
  const { newEmail, newPassoword } = req.body;
  const hashedPassword = await bcrypt.hash(newPassoword, 10);

  db.query(
    "UPDATE users SET email = ?, password = ? WHERE email = ?",
    [newEmail, hashedPassword, req.user.email],
    (err, result) => {
      if (err) throw err;
      if (result.affectedRows === 0) {
        return res.status(404).send("Usuário nao encontrado");
      }
      res.send("Usuario atualizado com sucesso");
    }
  );
});

// excluir
app.delete("./user", authenticateToken, (req, res) => {
  db.query(
    "DELETE FROM users WHERE email = ?",
    [req.user.email],
    (err, result) => {
      if (err) throw err;
      if (result.affectedRows === 0) {
        return res.status(404).send("Usuario nao encontrado");
      }
      res.send("Usuario deletado com sucesso");
    }
  );
});

// Rota para obter informações do usuário
app.get("/user", authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.query("SELECT email FROM users WHERE id = ?", [userId], (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      res.json(result[0]);
    } else {
      res.status(404).send("Usuário não encontrado");
    }
  });
});

// Rota para registro de usuários
app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    "SELECT email FROM users WHERE email = ?",
    [email],
    (err, result) => {
      if (err) throw err;
      if (result.length > 0) {
        return res.status(400).send("Usuário já existe!");
      }

      db.query(
        "INSERT INTO users (email, password) VALUES (?, ?)",
        [email, hashedPassword],
        (err, result) => {
          if (err) throw err;
          res.sendStatus(201); // Usuário registrado com sucesso
        }
      );
    }
  );
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
