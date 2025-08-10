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
    res.json({ reply: "Ошибка OpenAI: ${data.error?.message" });

  } catch (err) {
    console.error("❌ Ошибка сервера:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Сервер запущен на порту ${PORT}`));




