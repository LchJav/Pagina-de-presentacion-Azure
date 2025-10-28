const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MODEL = "models/gemini-pro";

Deno.serve(async (req) => {
  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set.");
      throw new Error("GEMINI_API_KEY is not set in Supabase secrets.");
    }

    const { contents, systemInstruction } = await req.json();
    const url = `https://generativelanguage.googleapis.com/v1/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const geminiReqBody = {
      contents: contents,
      generationConfig: {
        temperature: 0.7,
        topP: 1,
        topK: 1,
        maxOutputTokens: 256,
      },
    };

    console.log("Sending request to Gemini API...");
    console.log("URL:", url.replace(GEMINI_API_KEY, "GEMINI_API_KEY_HIDDEN")); // No exponer la llave en los logs
    console.log("Body:", JSON.stringify(geminiReqBody, null, 2));

    const geminiResponse = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiReqBody),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Error from Gemini API - Status:", geminiResponse.status);
      console.error("Error from Gemini API - Body:", errorText);
      
      // Devolvemos un error 500 genérico al cliente, pero con el detalle del error de Google en el cuerpo
      const clientError = {
        message: "Failed to fetch from Gemini API.",
        gemini_status: geminiResponse.status,
        gemini_response: errorText
      }
      
      return new Response(JSON.stringify(clientError), {
        status: 500, // Usar 500 para indicar un fallo del servidor proxy, no un 404
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const responseData = await geminiResponse.json();
    console.log("Successfully received response from Gemini API.");

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in Supabase function:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});