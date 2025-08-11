#!/bin/bash

# Deployment script for Google Cloud Run
# Usage: ./deploy-cloudrun.sh [PROJECT_ID] [IMAGE_TAG]
# Example: ./deploy-cloudrun.sh my-project-id v1.0.0
set -e

# Configuration
PROJECT_ID=${1:-"restaurant-booking-468706"}
SERVICE_NAME="restaurant-booking-api"
REGION="europe-west1"
IMAGE_TAG=${2:-"latest"}
ARTIFACT_REGISTRY_REPO="restaurant-booking"
ARTIFACT_REGISTRY_LOCATION="europe-west1"
IMAGE_NAME="$ARTIFACT_REGISTRY_LOCATION-docker.pkg.dev/$PROJECT_ID/$ARTIFACT_REGISTRY_REPO/$SERVICE_NAME:$IMAGE_TAG"

echo "Deploying Restaurant Booking App to Google Cloud Run"
echo "Project ID: $PROJECT_ID"
echo "Service Name: $SERVICE_NAME"
echo "Region: $REGION"
echo "Image Tag: $IMAGE_TAG"
echo "Image URL: $IMAGE_NAME"

# Configure Docker for Artifact Registry
echo "Configuring Docker for Artifact Registry..."
gcloud auth configure-docker $ARTIFACT_REGISTRY_LOCATION-docker.pkg.dev

# Create Artifact Registry repository if it doesn't exist
echo "Ensuring Artifact Registry repository exists..."
gcloud artifacts repositories describe $ARTIFACT_REGISTRY_REPO \
  --location=$ARTIFACT_REGISTRY_LOCATION \
  --format="value(name)" || \
gcloud artifacts repositories create $ARTIFACT_REGISTRY_REPO \
  --repository-format=docker \
  --location=$ARTIFACT_REGISTRY_LOCATION \
  --description="Docker repository for Restaurant Booking App"

# Build and push Docker image
echo "Building Docker image..."
docker build -f Dockerfile.cloudrun -t $IMAGE_NAME .

echo "Pushing image to Google Container Registry..."
docker push $IMAGE_NAME

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --min-instances 0 \
  --port 8080 \
  --set-env-vars "DEBUG=false,DATABASE_URL=sqlite:///./data/restaurant_booking.db"

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")

echo "Deployment completed!"
echo "Service URL: $SERVICE_URL"
echo "API Documentation: $SERVICE_URL/docs"
echo "Health Check: $SERVICE_URL/health"
