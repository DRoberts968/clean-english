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

  try {
    const response = await fetch('https://api.languagetool.org/v2/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        text: text,
        language: 'en-US',
      }).toString()
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('LanguageTool API error:', data);
      return res.status(response.status).json({ 
        error: 'LanguageTool API error',
        details: data.message || 'Unknown error'
      });
    }

    // Apply corrections from LanguageTool matches
    let cleaned = text;
    
    if (data.matches && Array.isArray(data.matches)) {
      // Sort matches by offset in reverse order so replacements don't affect positions
      const sortedMatches = [...data.matches].sort((a, b) => b.offset - a.offset);
      
      for (const match of sortedMatches) {
        if (match.replacements && match.replacements.length > 0) {
          // Use the first (best) replacement suggestion
          const replacement = match.replacements[0].value;
          cleaned = cleaned.substring(0, match.offset) + replacement + cleaned.substring(match.offset + match.length);
        }
      }
    }

    res.status(200).json({ cleaned: cleaned.trim() });
  } catch (error) {
    console.error('API error:', error.message);
    res.status(500).json({ error: error.message });
  }
};
