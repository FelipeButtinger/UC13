const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const app = express();
const cors = require("cors");
const bcrypt = require("bcrypt");
app.use(bodyParser.json());

app.use(
  cors(/*{
    origin: "http://localhost",
  }*/)
);

// Conexão com o banco de dados
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "login",
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  db.query(
    "SELECT * FROM users WHERE email = ? AND password = ?",
    [email, password],
    (err, results) => {
      if (err) throw err;
      if (results.length > 0) {
        res.sendStatus(200); // Login bem-sucedido
      } else {
        res.status(401).send("Credenciais inválidas");
      }
    }
  );
});

app.post("/register", async (req, res) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const { email, password } = req.body;
  db.query(
    "INSERT INTO users (email, password) VALUES (?, ?)",
    [email, password],
    (err, result) => {
      if (err) throw err;
      res.sendStatus(201); // Usuário registrado com sucesso
    }
  );
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
