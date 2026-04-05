import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const VPS_URL = process.env.VPS_METRICS_URL || 'http://139.59.109.76:19999'
    
    const response = await fetch(`${VPS_URL}/api/openclaw/cron`, {
      next: { revalidate: 0 }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch from VPS')
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch cron jobs:', error)
    return NextResponse.json({ jobs: [] })
  }
}
