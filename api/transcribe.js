// api/transcribe.js
// Server-side AssemblyAI transcription — API key never reaches the browser
// Accepts multipart/form-data with an 'audio' file field

export const config = { api: { bodyParser: false } }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

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
