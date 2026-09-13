module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text required' });
  }

  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key missing - check Vercel environment variables' });
  }

  try {
    const response = await fetch('https://api-inference.huggingface.co/models/pszemraj/long-t5-tglobal-base-sci-simplify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: text,
        parameters: {
          max_length: 512,
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error || 'Hugging Face API error' });
    }

    let cleaned = '';
    if (Array.isArray(data) && data.length > 0) {
      cleaned = data[0]?.summary_text || data[0]?.generated_text || '';
    } else if (data.summary_text) {
      cleaned = data.summary_text;
    } else if (data.generated_text) {
      cleaned = data.generated_text;
    }

    if (!cleaned) {
      return res.status(500).json({ error: 'No response from AI model' });
    }

    res.status(200).json({ cleaned: cleaned.trim() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
