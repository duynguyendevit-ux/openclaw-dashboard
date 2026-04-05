import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 10 // 10 seconds timeout

export async function GET() {
  try {
    const VPS_METRICS_URL = process.env.VPS_METRICS_URL || 'http://139.59.109.76:19999/api/metrics'
    
    console.log('Fetching from:', VPS_METRICS_URL)
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000) // 8s timeout
    
    const response = await fetch(VPS_METRICS_URL, {
      signal: controller.signal,
      cache: 'no-store',
      headers: {
        'Accept': 'application/json'
      }
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Failed to fetch system metrics:', error.message)
    return NextResponse.json({ 
      error: 'Failed to fetch metrics',
      details: error.message 
    }, { status: 500 })
  }
}
