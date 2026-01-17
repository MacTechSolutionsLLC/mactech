# MacTech Platforms Deployment Guide

Complete deployment instructions for all MacTech automation platforms.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+ (or compatible database)
- Docker and Docker Compose (optional, for containerized deployment)
- Python 3.9+ (for AI/ML microservices)

## Environment Setup

### 1. Clone and Install

```bash
cd /Users/patrick/mactech/platforms
npm install
```

### 2. Environment Variables

Create `.env` files in each module directory or use a central `.env` file:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mactech_platforms"

# Authentication
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="7d"

# External Integrations
NINJAONE_API_KEY="your-key"
EPS_API_KEY="your-key"
ITGLUE_API_KEY="your-key"
WFM_API_KEY="your-key"

# AI/ML Services
AI_SERVICE_URL="http://localhost:8000"
ML_MODEL_ENDPOINT="http://localhost:8001"

# Email
SMTP_HOST="smtp.example.com"
SMTP_USER="user@example.com"
SMTP_PASS="password"
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed database
npx prisma db seed
```

## Module Deployment

### Infrastructure Modules

```bash
# Data Center Deployment
cd infrastructure/data-center-deployment
npm install
npm run build
npm test
npm start

# Health Monitoring
cd infrastructure/health-monitoring
npm install
npm run build
npm test
npm start

# Network Configuration
cd infrastructure/network-config
npm install
npm run build
npm test
npm start
```

### Quality Assurance Modules

```bash
# ISO Compliance
cd quality-assurance/iso-compliance
npm install
npm run build
npm test
npm start

# Metrology Management
cd quality-assurance/metrology-management
npm install
npm run build
npm test
npm start

# Audit Readiness
cd quality-assurance/audit-readiness
npm install
npm run build
npm test
npm start
```

### Legal & Contract Modules

```bash
# Contract Management
cd legal-contracts/contract-management
npm install
npm run build
npm test
npm start

# Document Generation
cd legal-contracts/document-generation
npm install
npm run build
npm test
npm start

# Risk Analysis
cd legal-contracts/risk-analysis
npm install
npm run build
npm test
npm start
```

## Docker Deployment

### Individual Module

Each module includes a `Dockerfile`:

```bash
cd platforms/infrastructure/data-center-deployment
docker build -t mactech-data-center-deployment .
docker run -p 3000:3000 mactech-data-center-deployment
```

### Docker Compose (All Modules)

```yaml
version: '3.8'
services:
  database:
    image: postgres:14
    environment:
      POSTGRES_DB: mactech_platforms
      POSTGRES_USER: mactech
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
  
  data-center-deployment:
    build: ./infrastructure/data-center-deployment
    ports:
      - "3001:3000"
    environment:
      DATABASE_URL: postgresql://mactech:password@database:5432/mactech_platforms
    depends_on:
      - database
  
  health-monitoring:
    build: ./infrastructure/health-monitoring
    ports:
      - "3002:3000"
    environment:
      DATABASE_URL: postgresql://mactech:password@database:5432/mactech_platforms
    depends_on:
      - database
```

Deploy with:

```bash
docker-compose up -d
```

## AI/ML Microservices

AI/ML features are implemented as Python microservices:

```bash
# Install Python dependencies
cd platforms/ai-services
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Start AI service
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Integration with Next.js App

Modules are integrated into the Next.js app via API routes:

```typescript
// app/api/infrastructure/deployments/route.ts
import { deploymentService } from '@/platforms/infrastructure/data-center-deployment/service'

export async function POST(request: Request) {
  // Use deployment service
}
```

## Health Checks

Each module provides a health check endpoint:

```bash
curl http://localhost:3000/api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-09T12:00:00Z",
  "version": "1.0.0",
  "checks": {
    "database": true,
    "externalServices": {
      "ninjaone": true,
      "eps": true
    }
  }
}
```

## Monitoring

- **Logging:** Structured JSON logs to stdout
- **Metrics:** Prometheus-compatible metrics endpoints
- **Tracing:** OpenTelemetry support

## Scaling Considerations

- **Horizontal Scaling:** Stateless services can be scaled horizontally
- **Database:** Use connection pooling and read replicas
- **Caching:** Redis for frequently accessed data
- **Queue:** RabbitMQ or AWS SQS for async processing

## Security

- **Authentication:** JWT tokens with refresh tokens
- **Authorization:** Role-based access control (RBAC)
- **Input Validation:** Zod schemas for all inputs
- **Rate Limiting:** Express rate limiter
- **HTTPS:** Required in production

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify DATABASE_URL is correct
   - Check database is running
   - Verify network connectivity

2. **Module Not Starting**
   - Check environment variables
   - Verify dependencies installed
   - Check logs for errors

3. **Integration Failures**
   - Verify external service credentials
   - Check network connectivity
   - Review API rate limits

## Support

For issues or questions:
- Review module-specific README files
- Check logs in `/var/log/mactech-platforms/`
- Contact MacTech support

---

*Last Updated: 2025-01-09*  
*Document Version: 1.0.0*



