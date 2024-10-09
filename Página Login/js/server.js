const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
app.use(bodyParser.json());

const SECRET_KEY = "shh";

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

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  db.query(
    "SELECT * FROM users WHERE email = ? AND password = ?",
    [email],
    async (err, results) => {
      if (err) throw err;
      if (
        result.length === 0 ||
        !(await bcrypt.compare(password, result[0].password))
      ) {
        return res.status(400).send("Credenciais inválidas");
      }
    }
  );
});

app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  db.query(
    "SELECT email FROM users WHERE email = ?",
    [email],
    (err, result) => {
      if (err) throw err;
      if (result.length > 0) {
        return res.status(400).send("Usuário Já existe");
      }
    }
  );
  db.query(
    "INSERT INTO users (email, password) VALUES (?, ?)",
    [email, hashedPassword],
    (err, result) => {
      if (err) throw err;

      res.send("Usuário Registrado com sucesso"); // Usuário registrado com sucesso
    }
  );
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
