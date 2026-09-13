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

  const hfToken = process.env.HF_TOKEN;
  if (!hfToken) {
    return res.status(500).json({ error: 'HF_TOKEN environment variable not set' });
  }

  try {
    const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hfToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistralai/Mistral-7B-Instruct-v0.1',
        messages: [
          {
            role: 'system',
            content: 'You are a professional editor. Fix grammar, spelling, and punctuation in the text. Keep the original meaning and use clear, simple English. Return only the corrected text, nothing else.'
          },
          {
            role: 'user',
            content: text
          }
        ],
        max_tokens: 512,
        temperature: 0.7
      })
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error('HF API error:', response.status, responseText);
      return res.status(response.status).json({ 
        error: `Hugging Face API error: ${response.status}`,
        details: responseText 
      });
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Response:', responseText);
      return res.status(500).json({ 
        error: 'Invalid response from Hugging Face API',
        details: responseText.substring(0, 200)
      });
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Unexpected response structure:', data);
      return res.status(500).json({ error: 'No response from AI model' });
    }

    const cleaned = data.choices[0].message.content.trim();

    res.status(200).json({ cleaned });
  } catch (error) {
    console.error('API error:', error.message);
    res.status(500).json({ error: error.message });
  }
};
