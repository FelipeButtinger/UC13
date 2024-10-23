const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
app.use(bodyParser.json());

const SECRET_KEY = "shh";
const authenticateToken = (req, res, next) => {
  const token =
    req.headers["authorization"] && req.headers["authorization"].split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};
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
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, result) => {
      if (err) throw err;
      if (
        result.length === 0 ||
        !(await bcrypt.compare(password, result[0].password))
      ) {
        return res.status(400).send("Credenciais inválidas");
      }
      const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: "1h" });

      res.json({ token });
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

app.get("/user", authenticateToken, (req, res) => {
  db.query(
    "SELECT email FROM users WHERE email = ?",
    [req.user.email],
    (err, result) => {
      if (err) throw err;

      if (result.lenght === 0) {
        return res.status(404).send("Usuário não encontrado");
      }
      res.json(result[0]);
    }
  );
});

app.put("/user", authenticateToken, async (req, res) => {
  const { newEmail, newPassword } = req.body;
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  db.query(
    "UPDATE users SET email = ?, password = ? WHERE email = ?",
    [newEmail, hashedPassword, req.user.email],
    (err, result) => {
      if (err) throw err;

      if (result.affectedRows === 0) {
        return res.status(404).send("Usuário não encontrado");
      }
      res.send("Usuário atualizado com sucesso");
    }
  );
});

app.delete("/user", authenticateToken, (req, res) => {
  db.query(
    "DELETE FROM users WHERE email = ?",
    [req.user.email],
    (err, result) => {
      if (err) throw err;

      if (result.affectedRows === 0) {
        return res.status(404).send("Usuário não encontrado");
      }
      res.send("Usuário deletado com sucesso");
    }
  );
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
