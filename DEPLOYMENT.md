# Deployment Guide

This document outlines the standardized deployment configurations for the Restaurant Booking App to Google Cloud Run.

## Configuration Summary

All deployment methods now use the following standardized settings:

- **Region**: `europe-west1`
- **Service Name**: `restaurant-booking-api`
- **Platform**: Cloud Run (managed)
- **Port**: `8080`
- **Memory**: `512Mi`
- **CPU**: `1`
- **Max Instances**: `10`
- **Min Instances**: `0`

## Important: Artifact Registry Migration

**Breaking Change**: This project has been migrated from Google Container Registry (GCR) to Google Artifact Registry for better performance and security.

**New Image Repository Pattern**:

- **Old**: `gcr.io/PROJECT_ID/restaurant-booking-api`
- **New**: `europe-west1-docker.pkg.dev/PROJECT_ID/restaurant-booking/restaurant-booking-api`

**Required Changes**:

1. **API Enabled**: Ensure `artifactregistry.googleapis.com` is enabled
2. **Permissions**: Service account needs `roles/artifactregistry.admin`
3. **Docker Auth**: Use `gcloud auth configure-docker europe-west1-docker.pkg.dev`

## Deployment Methods

### 1. GitHub Actions (Recommended)

**Trigger**: Automatic on push to `main` branch

**Configuration**: `.github/workflows/deploy.yml`

**Features**:

- Runs tests before deployment
- Builds and pushes Docker image with commit SHA tag
- Deploys to Cloud Run using environment variables from GitHub secrets

**Required Secrets**:

- `GCP_PROJECT_ID`: Your Google Cloud Project ID
- `GCP_SERVICE_ACCOUNT_KEY`: Base64 encoded service account key

### 2. Google Cloud Build

**Trigger**: Manual or via Cloud Build triggers

**Configuration**: `cloudbuild.yaml`

**Usage**:

```bash
gcloud builds submit --config cloudbuild.yaml
```

**Features**:

- Uses commit SHA for image tagging
- Optimized for CI/CD pipelines
- Automatic deployment after successful build

### 3. Manual Deployment Script

**Configuration**: `deploy-cloudrun.sh`

**Usage**:

```bash
# Using defaults (restaurant-booking-468706 project, latest tag)
./deploy-cloudrun.sh

# Specify project ID
./deploy-cloudrun.sh my-project-id

# Specify project ID and image tag
./deploy-cloudrun.sh my-project-id v1.0.0
```

**Features**:

- Interactive deployment with progress output
- Configurable project ID and image tag
- Builds image locally before deployment

### 4. Static Cloud Run YAML

**Configuration**: `cloudrun.yaml`

**Usage**:

```bash
# Replace PROJECT_ID with your actual project ID
sed 's/PROJECT_ID/your-project-id/g' cloudrun.yaml | gcloud run services replace -
```

**Features**:

- Declarative configuration
- Can be version controlled
- Useful for infrastructure as code

## Environment Variables

All deployment methods set the following environment variables:

- `DEBUG=false`: Disables debug mode for production
- `DATABASE_URL=sqlite:///./data/restaurant_booking.db`: SQLite database path
- `PORT=8080`: Service port (automatically set by Cloud Run)

## Security Notes

1. **SECRET_KEY**: After deployment, update the SECRET_KEY environment variable:

   ```bash
   gcloud run services update restaurant-booking-api \
     --region=europe-west1 \
     --set-env-vars="SECRET_KEY=your-secure-random-key"
   ```

2. **Authentication**: The service is currently deployed with `--allow-unauthenticated`. Consider restricting access for production use.

## Troubleshooting

### Common Issues

1. **Region Mismatch**: All configurations now use `europe-west1`. If you see region conflicts, ensure you're using the latest configuration files.

2. **Image Not Found**: Ensure the Docker image exists in Google Container Registry before deployment.

3. **Permission Errors**: Verify your service account has the necessary Cloud Run and Container Registry permissions.

### GitHub Actions Authentication Issues

If you encounter authentication errors like `denied: Unauthenticated request`, follow these steps:

#### 1. Create Service Account with Proper Permissions

```bash
# Create service account
gcloud iam service-accounts create restaurant-booking-deployer \
    --description="Service account for Restaurant Booking App deployment" \
    --display-name="Restaurant Booking Deployer"

# Grant necessary permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:restaurant-booking-deployer@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/run.admin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:restaurant-booking-deployer@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/storage.admin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:restaurant-booking-deployer@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/artifactregistry.writer"

# For legacy Container Registry (if using GCR)
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:restaurant-booking-deployer@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/storage.objectAdmin"
```

#### 2. Generate and Configure Service Account Key

```bash
# Create service account key
gcloud iam service-accounts keys create key.json \
    --iam-account=restaurant-booking-deployer@YOUR_PROJECT_ID.iam.gserviceaccount.com

# Copy the entire content of key.json for GitHub secrets
cat key.json
```

#### 3. Set GitHub Repository Secrets

In your GitHub repository settings → Secrets and variables → Actions:

- **GCP_PROJECT_ID**: Your Google Cloud Project ID (e.g., `restaurant-booking-468706`)
- **GCP_SERVICE_ACCOUNT_KEY**: The entire JSON content from the key.json file

#### 4. Alternative: Use Workload Identity (More Secure)

For production environments, consider using Workload Identity instead of service account keys:

```bash
# Enable Workload Identity
gcloud iam service-accounts add-iam-policy-binding \
    --role roles/iam.workloadIdentityUser \
    --member "principalSet://iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/POOL_ID/attribute.repository/OWNER/REPO" \
    restaurant-booking-deployer@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

### Health Check

After deployment, verify the service is running:

```bash
curl https://your-service-url/health
```

## Monitoring

- **Service URL**: Check the deployment output for the service URL
- **Logs**: View logs in Google Cloud Console or via `gcloud logs`
- **API Documentation**: Available at `https://your-service-url/docs`
