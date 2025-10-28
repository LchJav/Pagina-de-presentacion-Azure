console.log('--- Cargando server.js (versión con depuración) ---');
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // agregado
import path from 'path';
import { fileURLToPath } from 'url';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors()); // permite peticiones desde el navegador (ajusta en prod)
app.use(express.json());

// Ruta específica para servir index.html en la raíz
app.get('/', (req, res) => {
    console.log('>>> Petición recibida en la ruta /');
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(express.static(__dirname)); // Servir otros archivos estáticos

// logging simple para verificar que la petición llega
app.use((req, res, next) => {
  console.log(`[server] ${req.method} ${req.url}`);
  next();
});

const PORT = process.env.PORT || 3001;
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || 'models/gemini-1.5-flash';

if (!API_KEY) {
  console.error('Falta GEMINI_API_KEY en .env');
  process.exit(1);
}

app.post('/api/generate', async (req, res) => {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/${MODEL}:generateContent?key=${API_KEY}`;
    const geminiReqBody = {
        contents: req.body.contents,
        systemInstruction: req.body.systemInstruction,
        generationConfig: {
            temperature: 0.7,
            topP: 1,
            topK: 1,
            maxOutputTokens: 256,
        }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiReqBody)
    });
    const text = await response.text();
    res.status(response.status).send(text);
  } catch (err) {
    console.error('Error en el proxy hacia Gemini:', err);
    res.status(500).json({ error: 'Error interno del servidor proxy.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado. Por favor, abre tu navegador y ve a http://localhost:${PORT}`);
});
