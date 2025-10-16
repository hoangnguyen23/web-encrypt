require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

app.use(cors({
    origin: ["https://web-encrypt.onrender.com"], // ✅ chỉ cho phép frontend Render
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
}));

app.use(bodyParser.json());

// =========================
// 🔹 Cấu hình PostgreSQL
// =========================
const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // ✅ Render tự cấp biến này
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

// =========================
// 🔹 Route test
// =========================
app.get("/", (req, res) => {
    res.send("✅ Server is running!");
});

// =========================
// 🔹 API lưu message
// =========================
app.post("/save-message", async (req, res) => {
    const { plaintext, ciphertext, key, algorithm } = req.body;
    try {
        const query = `
      INSERT INTO encryption_logs (plaintext, ciphertext, key, algorithm)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
        const result = await pool.query(query, [plaintext, ciphertext, key, algorithm]);
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error("❌ Lỗi PostgreSQL:", err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// =========================
// 🔹 Bắt cổng Render
// =========================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server đang chạy trên cổng ${PORT}`));
