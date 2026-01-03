# Deployment Guide

This guide covers deploying the Credit Risk Analysis Platform to production.

## Architecture Overview

- **Frontend**: Vercel (recommended) or any Node.js host
- **Backend**: Render, Fly.io, or Railway
- **Python Service**: Render, Fly.io, or Railway
- **Database**: MongoDB Atlas (recommended)

## Step-by-Step Deployment

### 1. Setup MongoDB Atlas

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create free cluster
3. Create database user
4. Whitelist IP: `0.0.0.0/0` (allow from anywhere)
5. Get connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/credit-risk-analysis
   ```

### 2. Deploy Python Service (Render)

1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repository
4. Configure:
   ```
   Name: credit-risk-python
   Region: Choose closest to your users
   Branch: main
   Root Directory: python-service
   Runtime: Python 3.11
   Build Command: pip install -r requirements.txt && pip install -r requirements-optional.txt || true
   Start Command: uvicorn main:app --host 0.0.0.0 --port 8000
   ```
5. Deploy and note the service URL (e.g., `https://credit-risk-python.onrender.com`)

### 3. Deploy Backend API (Render)

1. Create new Web Service
2. Configure:
   ```
   Name: credit-risk-backend
   Region: Same as Python service
   Branch: main
   Root Directory: server
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   ```
3. Add environment variables:
   ```
   PORT=3001
   NODE_ENV=production
   MONGODB_URI=<your-atlas-connection-string>
   PYTHON_SERVICE_URL=<python-service-url>
   CLIENT_URL=<your-frontend-url>
   ```
4. Deploy and note the backend URL (e.g., `https://credit-risk-backend.onrender.com`)

### 4. Deploy Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repository
3. Configure:
   ```
   Framework Preset: Next.js
   Root Directory: ./
   Build Command: npm run build
   Output Directory: .next
   ```
4. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=<backend-url>/api
   ```
5. Deploy

### 5. Update CORS Settings

Update backend `.env` with frontend URL:
```env
CLIENT_URL=https://your-app.vercel.app
```

## Alternative: Docker Deployment

### Deploy to AWS/GCP/Azure

```bash
# Build images
docker-compose build

# Tag images
docker tag credit-risk-frontend:latest your-registry/credit-risk-frontend:latest
docker tag credit-risk-backend:latest your-registry/credit-risk-backend:latest
docker tag credit-risk-python:latest your-registry/credit-risk-python:latest

# Push to registry
docker push your-registry/credit-risk-frontend:latest
docker push your-registry/credit-risk-backend:latest
docker push your-registry/credit-risk-python:latest

# Deploy using your cloud provider's tools
```

## Environment Variables Summary

### Frontend
```env
NEXT_PUBLIC_API_URL=https://your-backend.com/api
```

### Backend
```env
PORT=3001
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
PYTHON_SERVICE_URL=https://your-python-service.com
CLIENT_URL=https://your-frontend.com
```

### Python Service
No environment variables needed.

## Post-Deployment Checklist

- [ ] All services are running and healthy
- [ ] MongoDB connection is working
- [ ] Frontend can reach backend API
- [ ] Backend can reach Python service
- [ ] File uploads work end-to-end
- [ ] Analysis completes successfully
- [ ] Charts render correctly
- [ ] History page shows past analyses

## Monitoring

### Health Check Endpoints

```bash
# Frontend
curl https://your-app.vercel.app

# Backend
curl https://your-backend.com/api/health

# Python Service
curl https://your-python-service.com/health
```

### Logs

- **Vercel**: Dashboard > Project > Deployments > View Logs
- **Render**: Dashboard > Service > Logs

## Troubleshooting

### Frontend can't reach backend
- Check CORS settings in backend
- Verify NEXT_PUBLIC_API_URL is correct
- Check network tab in browser DevTools

### Backend can't reach Python service
- Verify PYTHON_SERVICE_URL
- Check if both services are in same region
- Test with curl from backend container

### MongoDB connection fails
- Check connection string format
- Verify database user credentials
- Ensure IP whitelist includes `0.0.0.0/0`

### Analysis takes too long
- Increase timeout limits
- Check Python service logs
- Consider smaller dataset for testing

## Scaling

### Horizontal Scaling
- Frontend: Vercel auto-scales
- Backend: Increase instance count on Render
- Python: Add more workers or instances

### Vertical Scaling
- Upgrade to paid plans for more CPU/RAM
- Optimize ML models for faster inference
- Add caching layer (Redis)

## Cost Estimation

### Free Tier (Development)
- MongoDB Atlas: Free 512MB
- Render: 750 hours/month free
- Vercel: Unlimited for personal projects

### Production (Estimated)
- MongoDB Atlas: $0-9/month (Shared)
- Render: $7/month per service (2 services = $14)
- Vercel: $20/month (Pro plan)
Total: ~$35-45/month

## Security Considerations

- [ ] Use environment variables for secrets
- [ ] Enable HTTPS everywhere
- [ ] Set proper CORS origins
- [ ] Implement rate limiting
- [ ] Add authentication (future)
- [ ] Regular dependency updates
- [ ] Monitor for security vulnerabilities

## Maintenance

### Regular Tasks
- Monitor error logs weekly
- Check disk usage (uploads folder)
- Update dependencies monthly
- Backup MongoDB database
- Review performance metrics

### Updates
```bash
# Update dependencies
npm update
pip install --upgrade -r requirements.txt

# Test locally
npm run build
python -m pytest

# Deploy
git push origin main
