import { NextResponse } from 'next/server'

const OPENCLAW_GATEWAY = process.env.OPENCLAW_GATEWAY || 'http://localhost:18789'

export async function GET() {
  try {
    // Mock data for now - replace with actual OpenClaw API calls
    // In production, call: fetch(`${OPENCLAW_GATEWAY}/api/tasks/list`)
    
    const tasks = [
      {
        id: 'task-001',
        name: 'Crypto Price Check',
        status: 'completed',
        startedAt: new Date(Date.now() - 120000).toISOString(),
        completedAt: new Date(Date.now() - 60000).toISOString(),
        duration: 60000
      },
      {
        id: 'task-002',
        name: 'Interview Questions Sync',
        status: 'running',
        startedAt: new Date(Date.now() - 30000).toISOString(),
        duration: 30000
      },
      {
        id: 'task-003',
        name: 'Memory Consolidation',
        status: 'pending',
      }
    ]

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error('Failed to fetch tasks:', error)
    return NextResponse.json({ tasks: [] })
  }
}
