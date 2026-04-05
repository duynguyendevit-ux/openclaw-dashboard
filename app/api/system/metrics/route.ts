import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 10

// Mock data fallback
const getMockMetrics = () => ({
  cpu: {
    usage: 25.0,
    cores: 2,
    model: 'DO-Regular (VPS)'
  },
  memory: {
    total: 4106231808,
    used: 2381066240,
    free: 1725165568,
    percentage: 58.0
  },
  gpu: {
    available: false
  },
  uptime: 5296784,
  timestamp: Date.now(),
  source: 'mock'
})

export async function GET() {
  try {
    const VPS_METRICS_URL = process.env.VPS_METRICS_URL || 'http://metrics.tomtom79.tech/api/metrics'
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000) // 3s timeout
    
    const response = await fetch(VPS_METRICS_URL, {
      signal: controller.signal,
      cache: 'no-store',
      headers: {
        'Accept': 'application/json'
      }
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const data = await response.json()
    return NextResponse.json({ ...data, source: 'vps' })
  } catch (error: any) {
    console.warn('VPS fetch failed, using mock data:', error.message)
    // Fallback to mock data
    return NextResponse.json(getMockMetrics())
  }
}
