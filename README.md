# OpenClaw Dashboard

Real-time monitoring dashboard for OpenClaw agents, tasks, cron jobs, and system resources.

## Features

### 📊 System Monitoring
- **CPU Usage** - Real-time CPU utilization with core count
- **RAM Usage** - Memory consumption and availability
- **GPU Stats** - NVIDIA GPU monitoring (if available)
- **System Uptime** - Server uptime tracking

### 🤖 Agent Monitor
- **Active Sessions** - View all running OpenClaw sessions
- **Session Status** - Active, recent, or idle indicators
- **Message Count** - Track conversation activity
- **Last Activity** - Time since last message

### ⏰ Cron Jobs
- **Job List** - All scheduled cron jobs
- **Next Run Time** - Countdown to next execution
- **Status Tracking** - Success/failure indicators
- **Error Monitoring** - Consecutive error count

### 📋 Task Manager
- **Running Tasks** - Currently executing tasks
- **Task History** - Completed and failed tasks
- **Duration Tracking** - Execution time monitoring
- **Error Details** - Failure reason display

## Tech Stack

- **Next.js 16** - React framework with Turbopack
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Data visualization
- **Lucide React** - Icon library

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Open http://localhost:3000

## Environment Variables

Create `.env.local`:

```env
OPENCLAW_GATEWAY=http://localhost:18789
```

## API Endpoints

Dashboard fetches data from:

- `/api/system/metrics` - CPU, RAM, GPU stats
- `/api/openclaw/sessions` - Active sessions
- `/api/openclaw/cron` - Cron jobs
- `/api/openclaw/tasks` - Task list

## Auto-Refresh

- **System Stats:** Every 5 seconds
- **Sessions:** Every 10 seconds
- **Cron Jobs:** Every 10 seconds
- **Tasks:** Every 5 seconds

## Production Deployment

### Vercel

```bash
vercel --prod
```

### Docker

```bash
docker build -t openclaw-dashboard .
docker run -p 3000:3000 openclaw-dashboard
```

## Screenshots

### System Stats
Real-time CPU, RAM, GPU monitoring with progress bars

### Agent Monitor
Active sessions with status indicators and last activity

### Cron Jobs
Scheduled jobs with next run countdown

### Task Manager
Running, completed, and failed tasks with filtering

## License

MIT
