# Job Queue Monitor - Infrastructure

This directory contains Pulumi infrastructure as code (IaC) for deploying the Job Queue Monitor application in different environments.

## 📁 Directory Structure

```
infra/
├── components/          # Reusable Pulumi components
│   ├── db/             # PostgreSQL database component
│   ├── redis/          # Redis cache component
│   └── shared/         # Pulumi plugin for root shared/ TypeScript package
├── configs/            # Stack configuration files (for local and portfolio)
│   ├── Pulumi.dev.yaml
│   └── Pulumi.prod.yaml
├── local/              # Local development deployment
│   └── Pulumi.yaml
└── portfolio/          # Portfolio-integrated deployment
    └── Pulumi.yaml
```

## 🚀 Deployment Options

### 1. Local Development

**Use Case**: Local development without external dependencies

**Location**: `infra/local/`

**Configuration**: `infra/configs` (local stack configs dev and prod)

**Features**:
- Self-contained with own network
- Exposed ports for direct access
- No Traefik/reverse proxy
- PostgreSQL and Redis included
- Hot-reload for development

**Deployment**:
```bash
cd infra/local
pulumi stack select dev
pulumi up
```

**Access**:
- UI: http://localhost:5173
- API: http://localhost:3000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### 2. Portfolio Deployment

**Use Case**: Integrated with existing portfolio infrastructure (Traefik, shared network)

**Location**: `infra/portfolio/`

**Configuration**: `infra/configs`

**Features**:
- Integrates with core portfolio stack
- Uses shared Traefik reverse proxy
- TLS/SSL from core infrastructure
- Shared application network
- Subdomain routing

**Deployment**:
```bash
cd infra/portfolio
pulumi stack select dev  # or prod
pulumi up
```

**Prerequisites**:
- Portfolio core stack must be deployed first
- Stack reference configured in `CORE_STACK_NAME`

## ⚙️ Configuration

### Stack Configuration Files

Configuration is managed through Pulumi stack config files in `infra/configs/`. This folder contains configurations for **both local and portfolio** deployments.

**Pulumi.dev.yaml** - Development configurations
```yaml
config:
  job-queue-monitor:APP_PORT: "5173"
  job-queue-monitor:CORE_STACK_NAME: Rashad/portfolio-infra/dev
  job-queue-monitor:BUILD_PHASE_TARGET: development
  job-queue-monitor-standalone:DB_NAME: <encrypted>
  job-queue-monitor-standalone:DB_USER: <encrypted>
  job-queue-monitor-standalone:DB_PASSWORD: <encrypted>
  job-queue-monitor-standalone:DB_PORT: <encrypted>
  job-queue-monitor-standalone:REDIS_PORT: "6379"
  job-queue-monitor-standalone:DOMAIN_NAME: localhost
```

**Pulumi.prod.yaml** - Production configurations (same structure, different values)

### Configuration Parameters

#### Local Deployment (`local/Pulumi.yaml`)

| Parameter | Description | Default |
|-----------|-------------|---------|
| `API_APP_PORT` | Port inside API container | `3000` |
| `API_HOST_PORT` | Port exposed on host | `3000` |
| `UI_APP_PORT` | Port inside UI container | `5173` |
| `UI_HOST_PORT` | Port exposed on host | `5173` |
| `BUILD_PHASE_TARGET` | Build target (development/production) | `development` |
| `DB_NAME` | PostgreSQL database name | `job_queue_monitor` |
| `DB_USER` | PostgreSQL username | `job_queue_monitor` |
| `DB_PASSWORD` | PostgreSQL password | `job_queue_monitor` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `REDIS_PORT` | Redis port | `6379` |
| `DOMAIN_NAME` | Domain for CORS | `localhost` |

#### Portfolio Deployment (`portfolio/Pulumi.yaml`)

| Parameter | Description | Required |
|-----------|-------------|----------|
| `CORE_STACK_NAME` | Reference to portfolio core stack | Yes |
| `APP_PORT` | Application port | Yes |
| `BUILD_PHASE_TARGET` | Build target | No |
| `DB_NAME` | Database name | No |
| `DB_USER` | Database username | No |
| `DB_PASSWORD` | Database password | No |
| `DB_PORT` | Database port | No |

### Managing Secrets

Set encrypted configuration values:

```bash
# Set a secret value
pulumi config set --secret DB_PASSWORD my-secure-password

# Set regular config
pulumi config set DOMAIN_NAME example.com

# View current config
pulumi config
```

## 🏗️ Infrastructure Components

### Docker Resources

**Networks**:
- `job-queue-monitor-network` - Application network (local/standalone)
- Shared portfolio network (portfolio deployment)

**Volumes**:
- `job_queue_monitor_api_node_modules` - API dependencies
- `job_queue_monitor_ui_node_modules` - UI dependencies
- `job_queue_monitor_shared_node_modules` - Shared package dependencies
- `job_queue_monitor_db_data` - PostgreSQL data persistence
- `job_queue_monitor_redis_data` - Redis data persistence

**Containers**:
1. **PostgreSQL** - Primary database
   - Image: `postgres:14-alpine`
   - Port: 5432
   - Persistent volume for data

2. **Redis** - Queue and cache
   - Image: `redis:7-alpine`
   - Port: 6379
   - Persistent volume for data

3. **API** - NestJS backend
   - Built from `../api/Dockerfile`
   - Port: 3000
   - Environment variables injected from Pulumi
   - Health checks configured

4. **UI** - React frontend
   - Built from `../ui/Dockerfile`
   - Port: 5173 (dev) or 80 (prod)
   - Environment variables injected from Pulumi
   - Nginx in production

### Component Architecture

Components are defined in `infra/components/` and can be referenced as Pulumi plugins:

**Database Component** (`components/db/`)
- PostgreSQL container configuration
- Volume management
- Network attachment
- Health checks

**Redis Component** (`components/redis/`)
- Redis container configuration
- Volume management
- Network attachment

**Shared Component** (`components/shared/`)
- Pulumi plugin representing the root `shared/` folder
- Contains shared TypeScript types, interfaces, and constants
- Used by both API and UI containers

## 🔄 Deployment Workflow

### Initial Setup

1. **Install Pulumi** ([Installation Guide](https://www.pulumi.com/docs/install/))

2. **Login to Pulumi**:
   ```bash
   pulumi login
   ```

3. **Initialize Stack**:
   ```bash
   cd infra/local  # or portfolio
   pulumi stack init dev
   ```

### Deploy

```bash
# Select your stack
pulumi stack select dev

# Preview changes
pulumi preview

# Deploy infrastructure
pulumi up

# View outputs
pulumi stack output
```

### Update

```bash
# Make changes to Pulumi.yaml or configs
# Deploy updates
pulumi up
```

### Destroy

```bash
# Remove all infrastructure
pulumi destroy
```

## 🔍 Troubleshooting

### Check Container Logs

```bash
# List Pulumi outputs
pulumi stack output

# Get container names from outputs, then:
docker logs <container-name>
docker logs -f <container-name>  # Follow logs
```

### Inspect Resources

```bash
# List all resources in stack
pulumi stack

# Export stack state
pulumi stack export > stack-backup.json

# View resource details
docker ps
docker inspect <container-name>
```

## 🔐 Security Best Practices

1. **Use Secrets**: Always encrypt sensitive values
   ```bash
   pulumi config set --secret DB_PASSWORD secure-password
   ```

2. **Separate Stacks**: Use different stacks for dev/prod
   ```bash
   pulumi stack select prod
   ```

3. **Network Isolation**: Use Docker networks for container isolation

4. **Volume Permissions**: Ensure proper file permissions on volumes

5. **Regular Updates**: Keep Docker images up to date
   ```bash
   pulumi up --refresh
   ```

## 📊 Stack Outputs

After deployment, Pulumi provides outputs you can reference:

**Local Deployment**:
- `apiUrl` - API endpoint URL
- `uiUrl` - UI endpoint URL
- `dbHost` - Database host
- `redisHost` - Redis host

**Portfolio Deployment**:
- `appUrl` - Application URL (behind Traefik)
- `apiContainerId` - API container ID
- `uiContainerId` - UI container ID

View outputs:
```bash
pulumi stack output
pulumi stack output apiUrl
```

## 🔗 Integration with Core Portfolio Stack

The portfolio deployment integrates with a core infrastructure stack that provides:

- **Traefik** - Reverse proxy and load balancer
- **TLS Certificates** - Automatic HTTPS with Let's Encrypt
- **Shared Network** - Application network for all services
- **Monitoring** - Centralized logging and metrics

Stack reference configuration:
```yaml
coreStack:
  type: "pulumi:pulumi:StackReference"
  properties: { name: "${CORE_STACK_NAME}" }
```

Retrieved from core stack:
- `appNetworkName` - Shared Docker network
- `domainName` - Base domain
- `routerEntrypoint` - Traefik entrypoint
- `enableTls` - TLS configuration

## 📝 Environment Variables

Variables are automatically injected into containers:

**API Container**:
- `DB_HOST` - PostgreSQL host
- `DB_PORT` - PostgreSQL port
- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password
- `DB_DATABASE` - Database name
- `REDIS_HOST` - Redis host
- `REDIS_PORT` - Redis port
- `PORT` - API server port
- `NODE_ENV` - Environment (development/production)

**UI Container**:
- `VITE_API_URL` - API endpoint URL
- `VITE_WS_URL` - WebSocket endpoint URL

## 📚 Additional Resources

- [Pulumi Documentation](https://www.pulumi.com/docs/)
- [Pulumi Docker Provider](https://www.pulumi.com/registry/packages/docker/)
- [Pulumi YAML](https://www.pulumi.com/docs/languages-sdks/yaml/)
- [Stack References](https://www.pulumi.com/docs/concepts/stack/#stackreferences)

## 🤝 Contributing

When modifying infrastructure:

1. Test changes in dev stack first
2. Document new configuration parameters
3. Update this README with changes
4. Use meaningful commit messages
5. Review resource changes with `pulumi preview`

## 📄 License

Infrastructure code follows the same license as the main project (UNLICENSED).
