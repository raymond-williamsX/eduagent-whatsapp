require("dotenv").config();

const express = require("express");
const { GoogleGenAI } = require("@google/genai");
const { MessagingResponse } = require("twilio").twiml;

const app = express();

app.use(express.urlencoded({ extended: false }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.post("/whatsapp", async (req, res) => {

  const incomingMessage = req.body.Body;

  let reply;

  try {

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: incomingMessage,
    });

    reply = result.text;

  } catch (error) {

    console.error(error);

    reply =
      "Sorry, Edu Agent AI is temporarily unavailable.";

  }

  const twiml = new MessagingResponse();

  twiml.message(reply);

  res.writeHead(200, {
    "Content-Type": "text/xml",
  });

  res.end(twiml.toString());
});

app.listen(3000, () => {
  console.log(
    "Edu Agent AI WhatsApp Bot Running"
  );
});