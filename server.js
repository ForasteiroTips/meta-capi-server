const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

app.post('/send-event', async (req, res) => {
  try {
    const { event_name, event_id, user_data } = req.body;

    const payload = {
      data: [{
        event_name,
        event_time: Math.floor(Date.now() / 1000),
        event_id,
        action_source: "website",
        event_source_url: "https://forasteirotips.github.io/forasteiro/",
        user_data
      }]
    };

    const url = `https://graph.facebook.com/v19.0/${process.env.PIXEL_ID}/events?access_token=${process.env.ACCESS_TOKEN}`;
    const fbRes = await axios.post(url, payload);
    res.status(200).json({ success: true, response: fbRes.data });
  } catch (err) {
    console.error("Erro ao enviar evento:", err.response?.data || err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
