const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const logger = require("firebase-functions/logger");

const API_KEY = functions.config().gemini.key;
const MODEL = "models/gemini-1.5-flash";

const app = express();

app.use(cors({origin: true}));
app.use(express.json());

app.post("/generate", async (req, res) => {
  logger.info("Request received at /generate", {body: req.body});

  if (!API_KEY) {
    logger.error("GEMINI_API_KEY is not configured.");
    return res.status(500).json({error: "Server configuration error."});
  }

  try {
    const url = "https://generativelanguage.googleapis.com/v1beta/" +
                `${MODEL}:generateContent?key=${API_KEY}`;

    const geminiReqBody = {
      contents: req.body.contents,
      systemInstruction: req.body.systemInstruction,
      generationConfig: {
        temperature: 0.7,
        topP: 1,
        topK: 1,
        maxOutputTokens: 256,
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(geminiReqBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("Gemini API error", {
        status: response.status,
        error: errorText,
      });
      return res.status(response.status).send(errorText);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    logger.error("Error proxying request to Gemini:", err);
    return res.status(500).json({error: "Internal server error."});
  }
});

exports.api = functions.https.onRequest(app);
