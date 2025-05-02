const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/send-event', async (req, res) => {
  try {
    const { event_name, event_id, user_data = {}, custom_data = {} } = req.body;

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
    const userAgent = user_data.client_user_agent || req.headers['user-agent'];

    const payload = {
      data: [{
        event_name: event_name || "Lead",
        event_time: Math.floor(Date.now() / 1000),
        event_id: event_id || `evt_${Date.now()}`,
        action_source: "website",
        event_source_url: "https://forasteirotips.github.io/forasteiro/",
        user_data: {
          ...user_data,
          external_id: user_data.external_id || user_data.fbp || user_data.fbc || `anon_${Date.now()}`,
          fbp: user_data.fbp,
          fbc: user_data.fbc,
          client_user_agent: userAgent,
          client_ip_address: ip
        },
        custom_data: {
          value: custom_data.value ?? 0,
          currency: custom_data.currency || "BRL"
        }
      }]
    };

    console.log(`[${new Date().toISOString()}] Evento recebido:`, {
      event_name: payload.data[0].event_name,
      event_id: payload.data[0].event_id,
      fbp: user_data.fbp,
      fbc: user_data.fbc,
      ip,
      user_agent: userAgent
    });

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
