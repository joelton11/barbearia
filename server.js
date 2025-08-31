import express from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const app = express();

// Middleware
app.use(express.json());
app.use(express.static("public"));
app.use("/adm", express.static("adm"));

// Banco de dados
const db = await open({
  filename: "database.sqlite",
  driver: sqlite3.Database
});

// Criação da tabela
await db.exec(`
  CREATE TABLE IF NOT EXISTS agendamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    telefone TEXT,
    corte TEXT,
    data TEXT,
    hora TEXT,
    concluido INTEGER DEFAULT 0
  )
`);

// Rota para agendar (cliente)
app.post("/api/agendar", async (req, res) => {
  try {
    const { nome, telefone, corte, data, hora } = req.body;
    if(!nome || !telefone || !corte || !data || !hora){
      return res.status(400).json({ error: "Todos os campos são obrigatórios!" });
    }

    await db.run(
      "INSERT INTO agendamentos (nome, telefone, corte, data, hora) VALUES (?, ?, ?, ?, ?)",
      [nome, telefone, corte, data, hora]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao salvar agendamento." });
  }
});

// Rota para listar agendamentos (ADM)
app.get("/api/agendamentos", async (req, res) => {
  try {
    const rows = await db.all("SELECT * FROM agendamentos ORDER BY data, hora");
    res.json(rows);
  } catch(err){
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar agendamentos." });
  }
});

// Rota para atualizar agendamento
app.put("/api/agendamento/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, telefone, corte, data, hora, concluido } = req.body;

    const existing = await db.get("SELECT * FROM agendamentos WHERE id = ?", [id]);
    if(!existing) return res.status(404).json({ error: "Agendamento não encontrado." });

    await db.run(
      `UPDATE agendamentos 
       SET nome = ?, telefone = ?, corte = ?, data = ?, hora = ?, concluido = ? 
       WHERE id = ?`,
      [
        nome || existing.nome,
        telefone || existing.telefone,
        corte || existing.corte,
        data || existing.data,
        hora || existing.hora,
        concluido !== undefined ? concluido : existing.concluido,
        id
      ]
    );

    res.json({ ok: true });
  } catch(err){
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar agendamento." });
  }
});

// Rota para excluir agendamento
app.delete("/api/agendamento/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.run("DELETE FROM agendamentos WHERE id = ?", [id]);
    res.json({ ok: true });
  } catch(err){
    console.error(err);
    res.status(500).json({ error: "Erro ao excluir agendamento." });
  }
});

// Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
