const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/send-event', async (req, res) => {
  try {
    const { event_name, event_id, user_data, custom_data, event_time } = req.body;

    const sanitizeFbc = (fbc) => /^fb\.1\.\d+\.[a-zA-Z0-9_-]+$/.test(fbc) ? fbc : undefined;

    const filteredUserData = Object.fromEntries(
      Object.entries({
        ...user_data,
        fbc: sanitizeFbc(user_data.fbc),
        external_id: user_data.fbp
      }).filter(([_, v]) => v !== undefined && v !== null && v !== "")
    );

    const payload = {
      data: [{
        event_name,
        event_time: event_time || Math.floor(Date.now() / 1000),
        event_id,
        action_source: "website",
        event_source_url: "https://forasteirotips.github.io/forasteiro/",
        user_data: filteredUserData,
        custom_data: custom_data || {}
      }]
    };

    console.log(`[${new Date().toISOString()}] Evento recebido:`, {
      event_name,
      event_id,
      user_data: filteredUserData,
      custom_data,
    });

    const url = `https://graph.facebook.com/v19.0/${process.env.PIXEL_ID}/events?access_token=${process.env.ACCESS_TOKEN}`;
    const fbRes = await axios.post(url, payload);

    console.log("📤 Enviado para o Facebook com sucesso:", fbRes.data);

    res.status(200).json({ success: true, response: fbRes.data });
  } catch (err) {
    console.error("❌ Erro ao enviar evento:", err.response?.data || err.message);
    res.status(500).json({ success: false, error: err.response?.data || err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
