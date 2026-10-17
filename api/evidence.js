import { searchEvidence } from '../server/evidenceSearch.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed.' })
  }

  const query = String(req.query.q || '').trim().slice(0, 400)
  if (!query) {
    return res.status(400).json({ error: 'Missing search query.' })
  }

  try {
    const result = await searchEvidence(query)
    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600')
    return res.status(200).json({ ok: true, ...result })
  } catch (error) {
    return res.status(502).json({
      error: error instanceof Error ? error.message : 'Evidence search failed.',
    })
  }
}