# CS436 - Cloud Computing E-commerce Project

## Overview

This project implements a cloud-native e-commerce application using Google Cloud Platform services. The system consists of a React frontend, Node.js backend API, MySQL database, and a serverless discount code generator.

## Architecture

The application architecture follows modern cloud design patterns:

- **Frontend**: React application served by Nginx on Google Compute Engine
- **Backend API**: Node.js/Express containerized application running on Google Kubernetes Engine
- **Database**: MySQL on Cloud SQL for persistent storage
- **Serverless Function**: Python Cloud Function for generating discount codes

## Prerequisites

- Google Cloud Platform account with billing enabled
- Google Cloud SDK installed locally
- Docker installed locally
- `kubectl` configured for your GCP project

## Deployment Instructions

### 1. Enable Required GCP APIs

```
gcloud services enable compute.googleapis.com
gcloud services enable container.googleapis.com
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable logging.googleapis.com
gcloud services enable monitoring.googleapis.com
gcloud services enable artifactregistry.googleapis.com
```

### 2. Database Setup (Cloud SQL)

- Create a MySQL instance through GCP Console
- Configure network access to allow connections
- Import the database schema and initial data from `/backend/database`

### 3. Backend Deployment (GKE)

```
# Create a GKE cluster
gcloud container clusters create backend-cluster-nodejs \
  --zone europe-west1-b \
  --num-nodes 1 \
  --machine-type e2-medium \
  --enable-autoscaling \
  --min-nodes 1 \
  --max-nodes 3

# Get credentials for kubectl
gcloud container clusters get-credentials backend-cluster-nodejs --zone europe-west1-b

# Build and push the backend Docker image
cd backend
docker build -t gcr.io/YOUR_PROJECT_ID/backend-clusture-nodejs:latest .
docker push gcr.io/YOUR_PROJECT_ID/backend-clusture-nodejs:latest

# Update Kubernetes manifests and deploy
sed -i 's|gcr.io/master-dreamer-460107-v1/backend-clusture-nodejs|gcr.io/YOUR_PROJECT_ID/backend-clusture-nodejs|' deployment.yaml
kubectl apply -f deployment.yaml

# Verify deployment and get external IP
kubectl get services
```

### 4. Frontend Deployment (Compute Engine)

- Create a Compute Engine VM instance
- SSH into the VM and run:

```
sudo apt install nginx -y
git clone https://github.com/suat0/cs436
cd cs436
cd frontend
npm install
npm run build
sudo cp -r build/* /var/www/html/
```

#### Configure Nginx:

```
sudo nano /etc/nginx/sites-available/default
```

Add this configuration:

```
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    root /var/www/html;
    index index.html;

    server_name _;

    location / {
        try_files $uri /index.html;
    }
}
```

#### Restart Nginx:

```
sudo systemctl restart nginx
```

- Configure firewall rules to allow HTTP traffic (explained in the report)

### 5. Serverless Function Deployment (Cloud Run)

- Navigate to Cloud Run in GCP Console
- Create a new function using Python 3.13
- Set the entry point to `generate_voucher_code`
- Deploy the function code from `/functions/kupon.py`

### 6. Performance Testing

```
cd locust
python -m locust -f LOCUSTFILENAME.py -H http://FRONTEND_IP
```

## Maintenance

### Backend Updates

```
# Build and push new image
docker build -t gcr.io/YOUR_PROJECT_ID/backend-clusture-nodejs:v2 .
docker push gcr.io/YOUR_PROJECT_ID/backend-clusture-nodejs:v2

# Update deployment
kubectl set image deployment/nodejs-backend nodejs-backend=gcr.io/YOUR_PROJECT_ID/backend-clusture-nodejs:v2
```

### Frontend Updates

```
cd cs436
git pull
cd frontend
npm install
npm run build
sudo cp -r build/* /var/www/html/
sudo systemctl restart nginx
```

## Repository Structure

```
cs436/
├── frontend/             # React application code
│   ├── src/              # React components and logic
│   ├── public/           # Static assets
├── backend/              # Node.js Express API
│   ├── src/              # API endpoints and business logic
│   ├── controllers/      # Database and business logic
│   ├── routes/           # API route definitions
│   └── Dockerfile        # Backend container definition
├── deployment.yaml       # K8s deployment
├── README.md             # readme file
├── locust/               # Performance testing
│   └── files             # Load test definitions
└── functions/            # Serverless functions
    └── kupon             # Discount code generator
```

## Cost Considerations

The estimated monthly cost for this project is approximately **$126/month**, including:

- **Frontend VM instances**: ~$44.20
- **GKE worker nodes**: ~$58.90
- **Cloud SQL**: ~$21.90
- **Network traffic & other services**: ~$1.80

### Cost optimization options include:

- Using preemptible VMs for frontend
- Committed-use discounts for steady GKE nodes
- Moving components to serverless options (Cloud Run)
- Implementing automatic shutdown schedules for dev environments

## Contributors

- Suat Emre Karabıçak 30649
- Ege Yardımcı 31024
- Emre Konak
