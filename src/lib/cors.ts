import { NextResponse } from 'next/server'

/** Réponses publiques, accès cross-origin pour le site vitrine et l'espace client. */
export function withPublicCors(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

export function applyCorsHeaders(response: NextResponse) {
  return withPublicCors(response)
}

export function handleOptions() {
  const response = new NextResponse(null, { status: 204 })
  return withPublicCors(response)
}
