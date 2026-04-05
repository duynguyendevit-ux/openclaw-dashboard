import { NextResponse } from 'next/server'

const OPENCLAW_GATEWAY = process.env.OPENCLAW_GATEWAY || 'http://localhost:18789'

export async function GET() {
  try {
    // Mock data for now - replace with actual OpenClaw API calls
    // In production, call: fetch(`${OPENCLAW_GATEWAY}/api/sessions/list`)
    
    const sessions = [
      {
        sessionKey: 'agent:main:telegram:direct:6844068298',
        kind: 'main',
        lastMessageAt: new Date().toISOString(),
        messageCount: 156
      },
      {
        sessionKey: 'agent:subagent:task:crypto-tracker',
        kind: 'isolated',
        lastMessageAt: new Date(Date.now() - 300000).toISOString(),
        messageCount: 12
      }
    ]

    return NextResponse.json({ sessions })
  } catch (error) {
    console.error('Failed to fetch sessions:', error)
    return NextResponse.json({ sessions: [] })
  }
}
