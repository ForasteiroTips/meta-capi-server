
const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

// Substitua pelos seus dados reais
const ACCESS_TOKEN = "EAA37L2okTfkBOxLqkPZBFlEUofiY6261ywoD8awV7pyXbBcOI0JyZAUYGJ5ddDbeOlQYi2r0RAK2wZA1VZCklvfpqG9gwFmCFDVvExGFdWQffnIuYqbc3GcId5NPK6mvQmKvVo72TFHxCN48pqtl1a99WJHqykUEKeymxatw66MiBGVyiZBFGyhZAWP3tlBa8ZCigZDZD";
const PIXEL_ID = "1381611613020370";
const TEST_EVENT_CODE = "TEST68374";

app.use(bodyParser.json());

function hashEmail(email) {
  return crypto.createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
}

app.post("/send-event", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, error: "Email é obrigatório" });
  }

  const payload = {
    data: [
      {
        event_name: "Lead",
        event_time: Math.floor(new Date().getTime() / 1000),
        user_data: {
          em: [hashEmail(email)],
        },
        action_source: "website",
        event_source_url: "https://forasteirotips.github.io/forasteiro/",
        test_event_code: TEST_EVENT_CODE
      }
    ]
  };

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      payload
    );
    res.json({ success: true, data: response.data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
