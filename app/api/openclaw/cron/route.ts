import { NextResponse } from 'next/server'

const OPENCLAW_GATEWAY = process.env.OPENCLAW_GATEWAY || 'http://localhost:18789'

export async function GET() {
  try {
    // Mock data for now - replace with actual OpenClaw API calls
    // In production, call: fetch(`${OPENCLAW_GATEWAY}/api/cron/list`)
    
    const jobs = [
      {
        id: '9e62df95-e40c-4841-bc0d-6d318d2da50f',
        name: 'Crypto Price Tracker',
        enabled: true,
        schedule: {
          kind: 'every',
          everyMs: 3600000 // 1 hour
        },
        state: {
          nextRunAtMs: Date.now() + 1800000, // 30 min from now
          lastRunAtMs: Date.now() - 1800000,
          lastRunStatus: 'ok',
          consecutiveErrors: 0
        }
      },
      {
        id: '643f65f6-073f-48ff-af99-b36765d9f5ef',
        name: 'Morning Briefing',
        enabled: true,
        schedule: {
          kind: 'cron',
          expr: '0 1 * * *' // Daily at 1 AM UTC (8 AM Vietnam)
        },
        state: {
          nextRunAtMs: Date.now() + 43200000, // 12 hours
          lastRunAtMs: Date.now() - 43200000,
          lastRunStatus: 'ok',
          consecutiveErrors: 0
        }
      }
    ]

    return NextResponse.json({ jobs })
  } catch (error) {
    console.error('Failed to fetch cron jobs:', error)
    return NextResponse.json({ jobs: [] })
  }
}
