// api/elevenlabs-token.js
// Secure server-side proxy — ELEVENLABS_API_KEY never reaches the browser

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'ElevenLabs API key not configured' })
  }

  const agentId = 'agent_8201kmb4w4yee66rdy46hpj5k4nm'

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
      {
        method: 'GET',
        headers: {
          'xi-api-key': apiKey,
        },
      }
    )

    if (!response.ok) {
      const err = await response.text()
      console.error('ElevenLabs error:', err)
      return res.status(response.status).json({ error: 'Failed to get signed URL' })
    }

    const data = await response.json()

    // Return the signed URL to the frontend — safe to expose, expires quickly
    return res.status(200).json({ signed_url: data.signed_url })
  } catch (err) {
    console.error('Token fetch error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
