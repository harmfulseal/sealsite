addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

const VIEW_COUNT_KEY = 'view_count'
const RATE_LIMIT_TIME_MS = 60 * 1000 // 1 minute

async function handleRequest(request) {
  const url = new URL(request.url)
  const kv = VIEW_COUNT_KV // Bind your KV namespace to this variable in Cloudflare dashboard

  if (url.pathname === '/api/viewcount/increment' && request.method === 'POST') {
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
    const now = Date.now()

    // Rate limiting using KV
    const lastTimeKey = `last_time_${ip}`
    const lastTimeStr = await kv.get(lastTimeKey)
    const lastTime = lastTimeStr ? parseInt(lastTimeStr) : 0

    if (now - lastTime < RATE_LIMIT_TIME_MS) {
      const countStr = await kv.get(VIEW_COUNT_KEY)
      const count = countStr ? parseInt(countStr) : 0
      return new Response(JSON.stringify({ count, message: 'Rate limit exceeded' }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Increment count
    let countStr = await kv.get(VIEW_COUNT_KEY)
    let count = countStr ? parseInt(countStr) : 0
    count++
    await kv.put(VIEW_COUNT_KEY, count.toString())
    await kv.put(lastTimeKey, now.toString())

    return new Response(JSON.stringify({ count }), {
      headers: { 'Content-Type': 'application/json' }
    })
  }

  if (url.pathname === '/api/viewcount' && request.method === 'GET') {
    const countStr = await kv.get(VIEW_COUNT_KEY)
    const count = countStr ? parseInt(countStr) : 0
    return new Response(JSON.stringify({ count }), {
      headers: { 'Content-Type': 'application/json' }
    })
  }

  return new Response('Not found', { status: 404 })
}
