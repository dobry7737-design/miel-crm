import { NextResponse } from 'next/server'

/** Réponses publiques, sans cookie ni identifiants — accès cross-origin large et sûr. */
export function withPublicCors(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  return response
}
