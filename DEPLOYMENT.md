# Deployment Guide

## Environment Configuration

### Development
The app uses `http://localhost:8000` by default for development.

### Production
Update the `.env.production` file with your deployed backend URL:

```bash
# Replace with your actual backend URL
VITE_API_URL=https://your-backend-url.com
```

## Common Deployment Platforms

### 1. Vercel
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard:
   - `VITE_API_URL` = your backend URL
3. Deploy automatically on push to main branch

### 2. Netlify
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables:
   - `VITE_API_URL` = your backend URL

### 3. AWS S3 + CloudFront
1. Build the app: `npm run build`
2. Upload `dist/` contents to S3 bucket
3. Configure CloudFront distribution
4. Set environment variables before build

### 4. Heroku
1. Add buildpack: `heroku/nodejs`
2. Set environment variables:
   ```bash
   heroku config:set VITE_API_URL=https://your-backend-url.com
   ```
3. Deploy with Git push

## Backend URL Examples

Your current backend is deployed at: **`https://apiss.siscom.tech`**

Other common deployment URLs:
- **Heroku**: `https://your-app-name.herokuapp.com`
- **Railway**: `https://your-app.railway.app`
- **Render**: `https://your-app.onrender.com`
- **AWS**: `https://api.yourdomain.com`
- **Custom Domain**: `https://api.eventnetworking.com`

## Build Commands

```bash
# Development build
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://api.example.com` |
| `VITE_APP_NAME` | Application name | `Event Networking` |
| `VITE_APP_VERSION` | App version | `1.0.0` |
| `VITE_ENVIRONMENT` | Environment | `production` |

## CORS Configuration

Make sure your backend allows requests from your frontend domain. Update the backend's `ALLOWED_ORIGINS` environment variable to include your deployed frontend URL.

Example backend `.env`:
```bash
ALLOWED_ORIGINS=https://your-frontend-domain.com,http://localhost:3000
```