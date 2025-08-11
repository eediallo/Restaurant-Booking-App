# Restaurant Booking App

A full-stack restaurant booking application built with FastAPI (backend) and React (frontend).

## Features

- User authentication and profile management
- Restaurant search and discovery
- Table booking system
- Booking history and management
- Restaurant reviews and ratings
- Mobile-responsive design

## Quick Start

### Local Development

1. **Backend Setup**:

   ```bash
   pip install -r requirements.txt
   python -m app.init_db
   uvicorn app.main:app --reload
   ```

2. **Frontend Setup**:
   ```bash
   cd web
   npm install
   npm run dev
   ```

### Production Deployment

For deployment to Google Cloud Run, see the [Deployment Guide](DEPLOYMENT.md).

## Documentation

- **API Documentation**: Available at `/docs` when running the backend
- **Deployment Guide**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Server Documentation**: [SERVER.md](SERVER.md)
- **Testing Summary**: [TESTING_SUMMARY.md](TESTING_SUMMARY.md)
