const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

app.use(cors());

app.use(bodyParser.json());

// Cấu hình PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

// Route test
app.get("/", (req, res) => {
    res.send("Server is running!");
});

// API lưu message
app.post("/save-message", async (req, res) => {
    const { ciphertext, algorithm } = req.body;
    try {
        const query = `
      INSERT INTO encryption_logs (ciphertext, algorithm)
      VALUES ($1, $2)
      RETURNING *;
    `;
        const result = await pool.query(query, [ciphertext, algorithm]);
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error("Lỗi PostgreSQL:", err);
        res.status(500).json({ success: false, error: err.message || JSON.stringify(err) });
    }
});

// Bắt cổng Render
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server đang chạy trên cổng ${PORT}`));
