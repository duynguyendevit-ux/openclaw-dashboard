import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Fetch from VPS metrics server
    const VPS_METRICS_URL = process.env.VPS_METRICS_URL || 'http://139.59.109.76:19999/api/metrics'
    
    const response = await fetch(VPS_METRICS_URL, {
      next: { revalidate: 0 } // No cache
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch from VPS')
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch system metrics:', error)
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 })
  }
}
