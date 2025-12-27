# Job Queue Monitor

A full-stack job queue monitoring and management application built with NestJS, React, BullMQ, PostgreSQL, and Redis. Monitor, manage, and analyze background jobs with real-time updates, advanced filtering, and comprehensive metrics.

## 🚀 Features

### Job Management
- **Create & Schedule Jobs** - Create jobs with different types (mock, API call, math) and schedule them to run at specific times
- **Real-time Updates** - WebSocket integration for live job status updates
- **Job Status Tracking** - Monitor jobs through their lifecycle: Pending → Running → Completed/Failed
- **Pause & Resume** - Pause jobs temporarily and resume them when needed
- **Retry Failed Jobs** - Automatically or manually retry failed jobs with configurable retry limits
- **Job Priority** - Set job priority levels (Critical, High, Normal, Low)

### Bulk Operations
- **Multi-select** - Select multiple jobs for batch operations
- **Bulk Actions** - Retry, pause, resume, or delete multiple jobs at once
- **Action Feedback** - View success/failure counts for bulk operations

### Search & Filtering
- **Status Filter** - Filter jobs by status (Pending, Running, Completed, Failed, Paused)
- **Search** - Search jobs by name or Nano ID
- **Sorting** - Sort by created date, updated date, started date, or completed date
- **Pagination** - Navigate through large job lists with customizable page size

### Metrics & Analytics
- **Queue Health** - Real-time BullMQ metrics (waiting, active, delayed jobs)
- **Job Statistics** - Track jobs by status, priority, and type
- **Success Rate** - Calculate job completion success rate
- **Performance Metrics** - Average processing time and jobs per hour
- **Recent Trends** - Job creation trends (last hour, last 24 hours)

### Data Export
- **CSV Export** - Export jobs as CSV with all job details
- **JSON Export** - Export jobs in JSON format
- **Filtered Export** - Export respects current filters and search criteria

## 🏗️ Architecture

```
job-queue-monitor/
├── api/              # NestJS backend API
├── ui/               # React frontend
├── shared/           # Shared TypeScript types and constants
└── infra/            # Pulumi infrastructure as code
```

### Tech Stack

**Backend (API)**
- **NestJS** - Progressive Node.js framework
- **BullMQ** - Redis-based queue for background jobs
- **TypeORM** - ORM for PostgreSQL database
- **WebSockets** - Real-time job updates
- **PostgreSQL** - Primary database
- **Redis** - Queue and cache storage

**Frontend (UI)**
- **React 19** - UI library with hooks
- **Material-UI v7** - Component library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **SWR** - Data fetching and caching
- **Socket.IO Client** - WebSocket client
- **Axios** - HTTP client

**Infrastructure**
- **Pulumi** - Infrastructure as Code
- **Docker** - Containerization
development orchestration

## 📋 Prerequisites

- **Pulumi** CLI installed ([Installation Guide](https://www.pulumi.com/docs/install/))
- **Docker** (Pulumi uses Docker to build and run containers)

## 🚦 Getting Started

### Deployment with Pulumi

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd job-queue-monitor
```

#### 2. Choose Your Deployment

**Local Development:**
```bash
cd infra/local
pulumi stack select dev
pulumi up
```

**Portfolio Deployment:**
```bash
cd infra/portfolio
pulumi stack select dev  # or prod
pulumi up
```

That's it! Pulumi will:
- Build and containerize the API and UI
- Provision PostgreSQL database
- Provision Redis cache
- Configure environment variables automatically
- Deploy all services with proper networking
- Set up health checks and monitoring

The application will be available at the configured domain (check Pulumi outputs).

### Optional: IDE Support

If you want VSCode IntelliSense and linting support while developing:

```bash
# Install shared package
cd shared
yarn install
yarn build

# Install API dependencies (for IDE support only)
cd ../api
yarn install

# Install UI dependencies (for IDE support only)
cd ../ui
yarn install
```

> **Note**: This step is **optional** and only needed for IDE features. The application runs perfectly in Docker containers without this step.

## 📁 Project Structure

```
job-queue-monitor/
├── api/
│   ├── src/
│   │   ├── config/          # Configuration modules
│   │   ├── database/        # Database module
│   │   ├── jobs/            # Jobs module (main feature)
│   │   │   ├── entities/    # TypeORM entities
│   │   │   ├── jobs.controller.ts
│   │   │   ├── jobs.service.ts
│   │   │   ├── jobs.gateway.ts    # WebSocket gateway
│   │   │   └── jobs.processor.ts  # BullMQ processor
│   │   └── main.ts
│   ├── test/
│   └── package.json
│
├── ui/
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── CreateJobForm.tsx
│   │   │   ├── JobsList.tsx
│   │   │   ├── JobDetails.tsx
│   │   │   ├── JobFilters.tsx
│   │   │   └── ui/          # Reusable UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page components
│   │   ├── services/        # API client
│   │   └── types/           # TypeScript types
│   └── package.json
│
├── shared/
│   ├── src/
│   │   ├── job.ts           # Job types and DTOs
│   │   ├── events.ts        # WebSocket events
│   │   ├── constants.ts     # API routes
│   │   └── pagination.ts    # Pagination types
│   └── package.json
│
└── infra/
    ├── components/          # Pulumi components
    │   ├── db/              # Database infrastructure
    │   ├── redis/           # Redis infrastructure
    │   └── shared/          # Shared resources
    └── configs/             # Environment configs
```

## 🔌 API Endpoints

### Jobs

- `GET /jobs` - List jobs with pagination and filters
- `GET /jobs/:nanoId` - Get job by Nano ID
- `POST /jobs` - Create a new job
- `POST /jobs/:nanoId/retry` - Retry a failed job
- `POST /jobs/:nanoId/pause` - Pause a job
- `POST /jobs/:nanoId/resume` - Resume a paused job
- `DELETE /jobs/:nanoId` - Delete a job
- `PATCH /jobs/:nanoId/status` - Update job status
- `POST /jobs/bulk` - Perform bulk operations
- `GET /jobs/export` - Export jobs as CSV or JSON
- `GET /jobs/metrics/dashboard` - Get metrics dashboard data

### WebSocket Events

**Server → Client**
- `job:created` - New job created
- `job:status-update` - Job status changed
- `job:deleted` - Job deleted

## 🎯 Usage Examples

### Creating a Job

```typescript
POST /jobs
Content-Type: application/json

{
  "name": "Process User Data",
  "type": "mock",
  "data": {
    "duration": 5000,
    "shouldFail": false
  },
  "priority": 3,
  "autoRetry": true,
  "maxRetries": 3,
  "scheduledAt": "2025-12-27T20:00:00Z"
}
```

### Bulk Operations

```typescript
POST /jobs/bulk
Content-Type: application/json

{
  "nanoIds": ["abc123", "def456", "ghi789"],
  "action": "retry"
}
```

### Export Jobs

```bash
# Export as JSON
GET /jobs/export?format=json

# Export as CSV with filters
GET /jobs/export?format=csv&status=failed&search=user
```

### Building for Production

Pulumi handles all builds automatically. Images are built when you run:

```bash
pulumi up
```

No manual build steps required.

## 🐳 Docker

All services run in Docker containers managed by Pulumi. No manual Docker commands needed.

```bash
cd infra/local  # or infra/configs or infra/portfolio
pulumi up
```

Pulumi handles:
- Building Docker images for API and UI
- Running PostgreSQL container
- Running Redis container
- Networking between containers
- Environment variable injection
- Health checks and restart policies

## 📊 Job Types

The system supports different job types:

1. **Mock Jobs** - Simulate job processing with configurable duration and failure rate
   ```json
   {
     "type": "mock",
     "data": { "duration": 5000, "shouldFail": false }
   }
   ```

2. **API Call Jobs** - Make HTTP requests to external APIs
   ```json
   {
     "type": "api_call",
     "data": { "url": "https://api.example.com", "method": "GET" }
   }
   ```

3. **Math Jobs** - Perform mathematical operations
   ```json
   {
     "type": "math",
     "data": { "operation": "add", "a": 5, "b": 3 }
   }
   ```

## 🎨 UI Features

- **Dashboard** - Overview of all jobs with quick actions
- **Metrics Page** - Comprehensive analytics and statistics
- **Job Details** - Detailed view with timeline and retry history
- **Responsive Design** - Works on desktop, tablet, and mobile

## 🔐 Security Considerations

- Input validation with class-validator
- CORS configuration for API
- Environment-based configuration
- Database connection pooling

## 📈 Performance

- **Sequential Processing** - Jobs are processed one at a time (concurrency: 1)
- **Connection Pooling** - Database connections are pooled for efficiency
- **Redis Caching** - BullMQ uses Redis for fast queue operations
- **SWR Caching** - Frontend caches API responses with automatic revalidation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the UNLICENSED license.

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) - Framework for building efficient server-side applications
- [BullMQ](https://docs.bullmq.io/) - Premium Queue package for handling distributed jobs
- [Material-UI](https://mui.com/) - React components for faster development
- [TypeORM](https://typeorm.io/) - ORM for TypeScript and JavaScript
