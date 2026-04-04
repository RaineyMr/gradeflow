// api/audio.js
// Combined audio processing - transcription and ElevenLabs token

export const config = { api: { bodyParser: false } }

export default async function handler(req, res) {
  if (req.method === 'POST' && req.headers['content-type']?.includes('multipart/form-data')) {
    return handleTranscription(req, res)
  } else if (req.method === 'POST') {
    return handleElevenLabsToken(req, res)
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}

async function handleTranscription(req, res) {
  const apiKey = process.env.ASSEMBLYAI_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'AssemblyAI API key not configured' })

  try {
    // Collect raw body buffer from the stream
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    const buffer = Buffer.concat(chunks)

    // Parse content-type to get boundary
    const contentType = req.headers['content-type'] || ''

    // Step 1 — Upload audio to AssemblyAI
    const uploadRes = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type':  contentType,
        'Transfer-Encoding': 'chunked',
      },
      body: buffer,
    })

    if (!uploadRes.ok) {
      const err = await uploadRes.text()
      console.error('AssemblyAI upload error:', err)
      return res.status(uploadRes.status).json({ error: 'Upload failed', detail: err })
    }

    const { upload_url } = await uploadRes.json()

    // Step 2 — Request transcription
    const transcriptRes = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'Authorization':  apiKey,
        'Content-Type':   'application/json',
      },
      body: JSON.stringify({
        audio_url:           upload_url,
        speech_model:        'best',
        language_detection:  true,   // auto-detect Spanish etc.
        punctuate:           true,
        format_text:         true,
      }),
    })

    if (!transcriptRes.ok) {
      const err = await transcriptRes.text()
      console.error('AssemblyAI transcript error:', err)
      return res.status(transcriptRes.status).json({ error: 'Transcription request failed', detail: err })
    }

    const { id: transcriptId } = await transcriptRes.json()

    // Step 3 — Poll for completion (max 30s)
    const pollUrl = `https://api.assemblyai.com/v2/transcript/${transcriptId}`
    const headers = { 'Authorization': apiKey }

    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 1000))

      const pollRes  = await fetch(pollUrl, { headers })
      const pollData = await pollRes.json()

      if (pollData.status === 'completed') {
        return res.status(200).json({
          success:    true,
          transcript: pollData.text,
          language:   pollData.language_code,
          words:      pollData.words,
        })
      }

      if (pollData.status === 'error') {
        return res.status(500).json({ error: 'Transcription failed', detail: pollData.error })
      }
    }

    return res.status(408).json({ error: 'Transcription timed out. Please try again.' })

  } catch (err) {
    console.error('Transcribe error:', err)
    return res.status(500).json({ error: 'Internal server error', detail: err.message })
  }
}

async function handleElevenLabsToken(req, res) {
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
