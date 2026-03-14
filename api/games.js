/**
 * Vercel serverless API route for /api/games
 * Returns active game codes. On Vercel, games are not persistent (no WebSocket server),
 * so this always returns empty. Multiplayer requires a separate backend (e.g. Railway).
 */
export function GET() {
  return new Response(
    JSON.stringify({ active: [] }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }
  )
}
