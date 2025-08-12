const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.post('/ask', async (req, res) => {
  try {
    const { message } = req.body;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-5",
        messages: [{ role: "user", content: message }],
        max_completion_tokens: 5000
      })
    });

    const data = await response.json();

    // ✅ Логируем весь ответ, если есть ошибка
    if (!response.ok) {
      console.error('⚠️ Ошибка от OpenAI API:', data);
      return res.status(response.status).json({ error: data });
    }

    res.json({ reply: data.choices?.[0]?.message?.content || "Ошибка: пустой ответ" });

  } catch (err) {
    console.error("❌ Ошибка сервера:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

app.post('/ask-photo', async (req, res) => {
  try {
    const { message } = req.body;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-5",
        messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Реши задачу. Напиши только ответ и номер ответа" },
            { type: "image_url", image_url: { url: message } }
          ]
        }
      ],
        max_completion_tokens: 5000
      })
    });

    const data = await response.json();

    // ✅ Логируем весь ответ, если есть ошибка
    if (!response.ok) {
      console.error('⚠️ Ошибка от OpenAI API:', data);
      return res.status(response.status).json({ error: data });
    }

    res.json({ reply: data.choices?.[0]?.message?.content || "Ошибка: пустой ответ" });

  } catch (err) {
    console.error("❌ Ошибка сервера:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

app.get("/openai-balance", async (req, res) => {
  try {
    const headers = { "Authorization": `Bearer ${OPENAI_API_KEY}` };

    const startDate = new Date();
    startDate.setDate(1);
    const endDate = new Date();

    const usageUrl = `https://api.openai.com/v1/dashboard/billing/usage?start_date=${startDate.toISOString().split("T")[0]}&end_date=${endDate.toISOString().split("T")[0]}`;
    const usageRes = await fetch(usageUrl, { headers });
    const usageData = await usageRes.json();

    console.log("🔹 Usage:", JSON.stringify(usageData, null, 2));

    const used = (usageData.total_usage || 0) / 100; // в $

    res.json({
      used: used,
      period_start: startDate.toISOString().split("T")[0],
      period_end: endDate.toISOString().split("T")[0]
    });

  } catch (err) {
    console.error("❌ Ошибка при запросе баланса:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Сервер запущен на порту ${PORT}`));










