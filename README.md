# AI Request Queue Server

비동기 AI 작업 처리 시스템. 요청을 큐에 넣고 워커가 백그라운드에서 처리합니다.

## Architecture

```
Client ──POST──▶ Express API ──┬── PostgreSQL (작업 저장)
                               └── Redis/BullMQ (큐 발행)
                                        │
                                    BullMQ Worker
                                        │
                                ┌── DB UPDATE (processing)
                                ├── AI 처리 (mock)
                                └── DB UPDATE (completed/failed)
```

## Tech Stack

- **API**: TypeScript, Express
- **Database**: PostgreSQL 16 + Prisma ORM
- **Queue**: Redis 7 + BullMQ
- **Container**: Docker + docker-compose

## Supported Task Types

| Task | Description | Input |
|------|-------------|-------|
| `summarize` | 텍스트 요약 | `{ text, maxLength }` |
| `translate` | 텍스트 번역 | `{ text, targetLang }` |
| `image_generate` | 이미지 생성 | `{ prompt, width, height }` |

## Quick Start

### Docker (Recommended)

```bash
git clone <repo-url> && cd que_server
cp .env.example .env
docker compose up -d --build
```

### Local Development

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev          # API server (port 8000)
npm run dev:worker   # Worker (separate terminal)
```

## API Endpoints

### Create Job
```bash
curl -X POST http://localhost:8000/api/v1/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "taskType": "summarize",
    "payload": { "text": "Long text to summarize...", "maxLength": 100 },
    "priority": 8
  }'
```
**Response**: `202 Accepted`

### Get Job Status
```bash
curl http://localhost:8000/api/v1/jobs/{job_id}
```

### List Jobs
```bash
curl "http://localhost:8000/api/v1/jobs?status=completed&page=1&limit=10"
```

### Cancel Job
```bash
curl -X DELETE http://localhost:8000/api/v1/jobs/{job_id}
```

### Health Check
```bash
curl http://localhost:8000/health
```

## EC2 Deployment

```bash
# 1. Install Docker on EC2
sudo yum update -y && sudo yum install -y docker
sudo service docker start
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 2. Clone and run
git clone <repo-url> && cd que_server
cp .env.example .env
docker compose up -d --build

# 3. Verify
curl http://localhost:8000/health
```

## Project Structure

```
src/
├── main.ts                  # Express app entrypoint
├── config.ts                # Environment config
├── db.ts                    # Prisma client
├── queue.ts                 # BullMQ queue
├── schemas/job.ts           # Zod validation schemas
├── services/job.service.ts  # Business logic
├── routes/
│   ├── jobs.ts              # Job CRUD endpoints
│   └── health.ts            # Health check
└── worker/
    ├── main.ts              # BullMQ worker entrypoint
    └── handlers/            # Task handlers (summarize, translate, image_gen)
```
