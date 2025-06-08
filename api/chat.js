export default async function handler(req, res) {
  // Allow CORS from any origin for dev/testing. Restrict in production.
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight (OPTIONS) request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'No message provided' });
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant for QueueAway. Answer user queries based on QueueAway’s features, pricing, support, and functionality, referencing the FAQ. If unsure, guide users to email support@queueaway.co.uk.",
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const reply = data.choices[0].message.content;
    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to contact OpenAI' });
  }
}

