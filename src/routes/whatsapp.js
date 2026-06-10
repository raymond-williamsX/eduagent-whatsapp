const express = require("express");
const router = express.Router();
const { MessagingResponse } = require("twilio").twiml;
const { generateResponse } = require("../services/gemini");

/**
 * POST /webhook/whatsapp
 * Webhook handler for incoming Twilio WhatsApp messages
 */
router.post("/whatsapp", async (req, res, next) => {
  const incomingMessage = req.body.Body;
  const from = req.body.From;

  // Log details of the incoming message
  console.log(`[WhatsApp Webhook] Received message from ${from || "unknown"}: "${incomingMessage || ""}"`);

  if (!incomingMessage || incomingMessage.trim() === "") {
    const twiml = new MessagingResponse();
    twiml.message("Please send a text message.");
    res.type("text/xml");
    return res.send(twiml.toString());
  }

  try {
    // Generate AI response via Gemini
    const replyText = await generateResponse(incomingMessage);
    
    // Log response
    console.log(`[WhatsApp Webhook] Gemini response for ${from || "unknown"}: "${replyText.substring(0, 100)}..."`);

    // Build TwiML response
    const twiml = new MessagingResponse();
    twiml.message(replyText);

    res.type("text/xml");
    return res.send(twiml.toString());
  } catch (error) {
    console.error("[WhatsApp Webhook] Error during processing:", error);

    // Provide a user-friendly fallback message via Twilio TwiML
    const twiml = new MessagingResponse();
    twiml.message("Sorry, I'm having trouble processing your message right now. Please try again later.");

    res.type("text/xml");
    return res.status(200).send(twiml.toString()); // Note: Return 200 so Twilio successfully delivers the fallback XML
  }
});

module.exports = router;
