# Deployment Guide

This guide covers deploying the Intinc Universal Dashboard to production.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Deployment Methods](#deployment-methods)
- [Docker Deployment](#docker-deployment)
- [Cloud Platforms](#cloud-platforms)
- [Post-Deployment](#post-deployment)
- [Monitoring](#monitoring)
- [Rollback](#rollback)
- [Troubleshooting](#troubleshooting)

## ✅ Prerequisites

Before deploying, ensure you have:

- [ ] Node.js 20+ installed
- [ ] Docker installed (for containerized deployment)
- [ ] Blink project credentials
- [ ] Sentry DSN (optional, for error tracking)
- [ ] Domain name and SSL certificate (for production)
- [ ] CI/CD pipeline configured (GitHub Actions)

## 🔐 Environment Setup

### Production Environment Variables

Create a `.env.production` file with:

```bash
# Blink Configuration
VITE_BLINK_PROJECT_ID=your_production_project_id
VITE_BLINK_PUBLISHABLE_KEY=your_production_publishable_key

# Error Tracking
VITE_SENTRY_DSN=your_sentry_dsn

# Environment
NODE_ENV=production
```

⚠️ **Never commit `.env.production` to version control!**

## 🚀 Deployment Methods

### Method 1: Static Build Deployment

Best for: Vercel, Netlify, AWS S3 + CloudFront

```bash
# 1. Build the application
npm run build

# 2. The dist/ folder contains your production build
# 3. Deploy the dist/ folder to your hosting provider
```

### Method 2: Docker Deployment

Best for: AWS ECS, Google Cloud Run, Kubernetes

```bash
# Build Docker image
docker build -t intinc-dashboard:latest \
  --build-arg VITE_BLINK_PROJECT_ID=$VITE_BLINK_PROJECT_ID \
  --build-arg VITE_BLINK_PUBLISHABLE_KEY=$VITE_BLINK_PUBLISHABLE_KEY \
  --build-arg VITE_SENTRY_DSN=$VITE_SENTRY_DSN \
  .

# Run container
docker run -d -p 80:80 intinc-dashboard:latest
```

### Method 3: CI/CD Pipeline

Best for: Automated deployments

The project includes GitHub Actions workflows:

- `deploy-staging.yml` - Auto-deploys `develop` branch to staging
- `deploy-production.yml` - Deploys `main` branch to production (with manual approval)

## 🐳 Docker Deployment

### Building the Image

```bash
# Build with environment variables
docker build -t intinc-dashboard:v1.0.0 \
  --build-arg VITE_BLINK_PROJECT_ID=$VITE_BLINK_PROJECT_ID \
  --build-arg VITE_BLINK_PUBLISHABLE_KEY=$VITE_BLINK_PUBLISHABLE_KEY \
  --build-arg VITE_SENTRY_DSN=$VITE_SENTRY_DSN \
  .

# Tag for registry
docker tag intinc-dashboard:v1.0.0 ghcr.io/krosebrook/intinc-dashboard:v1.0.0
docker tag intinc-dashboard:v1.0.0 ghcr.io/krosebrook/intinc-dashboard:latest

# Push to registry
docker push ghcr.io/krosebrook/intinc-dashboard:v1.0.0
docker push ghcr.io/krosebrook/intinc-dashboard:latest
```

### Running with Docker Compose

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Update and restart
docker-compose pull
docker-compose up -d
```

### Health Checks

The Docker image includes a health check endpoint:

```bash
# Check container health
docker ps

# Test health endpoint
curl http://localhost/health
```

## ☁️ Cloud Platforms

### AWS (Elastic Container Service)

1. **Create ECR Repository**
   ```bash
   aws ecr create-repository --repository-name intinc-dashboard
   ```

2. **Push Image to ECR**
   ```bash
   aws ecr get-login-password | docker login --username AWS --password-stdin $ECR_REGISTRY
   docker push $ECR_REGISTRY/intinc-dashboard:latest
   ```

3. **Create ECS Task Definition and Service**
   - Use Fargate or EC2 launch type
   - Configure load balancer
   - Set up auto-scaling

### Google Cloud Platform (Cloud Run)

```bash
# Deploy to Cloud Run
gcloud run deploy intinc-dashboard \
  --image gcr.io/PROJECT_ID/intinc-dashboard \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production"
```

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

## 📦 Post-Deployment

### 1. Verify Deployment

```bash
# Check if site is accessible
curl -I https://yourdomain.com

# Test health endpoint
curl https://yourdomain.com/health

# Check security headers
curl -I https://yourdomain.com | grep -i "x-frame-options\|content-security-policy"
```

### 2. Run Smoke Tests

```bash
# Test critical paths
curl https://yourdomain.com/api/dashboards
curl https://yourdomain.com/api/health

# Run E2E tests against production
BASE_URL=https://yourdomain.com npm run test:e2e
```

### 3. Configure DNS

- Set up A/CNAME records
- Configure SSL certificate
- Enable HTTPS redirect

### 4. Set up Monitoring

- Configure Sentry alerts
- Set up uptime monitoring
- Configure performance monitoring

## 📊 Monitoring

### Application Monitoring

- **Sentry**: Error tracking and performance monitoring
- **Logs**: Check container logs for errors
- **Metrics**: Monitor response times, error rates

### Infrastructure Monitoring

- **CPU/Memory**: Monitor resource usage
- **Disk Space**: Ensure adequate storage
- **Network**: Monitor bandwidth and latency

### Viewing Logs

```bash
# Docker logs
docker logs -f container_id

# Docker Compose logs
docker-compose logs -f

# Kubernetes logs
kubectl logs -f deployment/intinc-dashboard
```

## ⏮️ Rollback

### Docker Rollback

```bash
# Roll back to previous version
docker pull ghcr.io/krosebrook/intinc-dashboard:v0.9.0
docker stop current_container
docker run -d -p 80:80 ghcr.io/krosebrook/intinc-dashboard:v0.9.0
```

### Kubernetes Rollback

```bash
# Roll back to previous revision
kubectl rollout undo deployment/intinc-dashboard

# Roll back to specific revision
kubectl rollout undo deployment/intinc-dashboard --to-revision=2

# View rollout history
kubectl rollout history deployment/intinc-dashboard
```

### Vercel/Netlify Rollback

Use the web dashboard to roll back to a previous deployment.

## 🔧 Troubleshooting

### Issue: Application Not Starting

**Symptoms**: Container exits immediately

**Solutions**:
1. Check logs: `docker logs container_id`
2. Verify environment variables are set
3. Ensure port 80 is not already in use
4. Check for build errors

### Issue: 404 Errors on Refresh

**Symptoms**: SPA routes return 404 on page reload

**Solutions**:
1. Ensure nginx.conf has proper try_files directive
2. Check that all routes fall back to index.html
3. Verify nginx configuration is loaded

### Issue: Security Headers Not Applied

**Symptoms**: Headers missing in response

**Solutions**:
1. Verify nginx.conf includes security headers
2. Restart nginx: `docker-compose restart`
3. Check nginx configuration: `nginx -t`

### Issue: High Memory Usage

**Symptoms**: Container using excessive memory

**Solutions**:
1. Check for memory leaks in application
2. Reduce concurrent connections in nginx
3. Increase container memory limits
4. Review and optimize queries

### Issue: Slow Performance

**Symptoms**: Long load times, slow responses

**Solutions**:
1. Enable gzip compression in nginx
2. Configure browser caching
3. Use CDN for static assets
4. Optimize bundle size
5. Enable HTTP/2

## 📞 Support

For deployment issues:

- **Email**: devops@intinc.com
- **Slack**: #deployment-support
- **GitHub Issues**: [Create an issue](https://github.com/Krosebrook/intinc-universal-dashboard/issues)

## 🔐 Security Checklist

Before going live:

- [ ] HTTPS enabled with valid SSL certificate
- [ ] Security headers configured (CSP, X-Frame-Options, etc.)
- [ ] Environment variables secured
- [ ] Rate limiting enabled
- [ ] Error tracking configured
- [ ] Monitoring and alerts set up
- [ ] Backups configured
- [ ] Access logs enabled
- [ ] Regular security updates scheduled

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)

---

**Deployment checklist completed? You're ready to go live! 🚀**
