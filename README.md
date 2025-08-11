# Restaurant Booking App

A modern, full-stack restaurant booking application built with **FastAPI** (backend) and **React** (frontend), deployed on **Google Cloud Run** with automated CI/CD.

## Features

### Core Functionality

- **User Authentication**: Secure registration, login, logout with JWT tokens
- **Restaurant Discovery**: Advanced search with filters (cuisine, location, price range, features)
- **Table Booking System**: Real-time availability checking and reservation management
- **Booking Management**: Complete booking history and status tracking
- **Restaurant Reviews**: User reviews and ratings with detailed feedback
- **User Profiles**: Extended profile management with preferences and accessibility needs

### Advanced Features

- **Mobile-Responsive Design**: Optimized for all device types
- **Real-time API**: RESTful API with comprehensive documentation
- **Token Refresh**: Automatic token renewal for seamless user experience
- **Search & Filtering**: Advanced restaurant search with multiple criteria
- **Restaurant Details**: Direct access by restaurant name for better UX
- **Error Handling**: Comprehensive error management and user feedback

## Architecture

### Backend (FastAPI)

- **Framework**: FastAPI with async/await support
- **Database**: SQLite with SQLAlchemy ORM
- **Authentication**: JWT tokens with refresh mechanism
- **API Documentation**: Auto-generated OpenAPI/Swagger docs
- **Testing**: Comprehensive test suite with pytest

### Frontend (React + Vite)

- **Framework**: React 18 with modern hooks
- **Build Tool**: Vite for fast development and builds
- **Styling**: CSS modules with mobile-first responsive design
- **State Management**: Context API for authentication and app state
- **HTTP Client**: Axios with interceptors for token management
- **Routing**: React Router for SPA navigation

### Infrastructure

- **Deployment**: Google Cloud Run (serverless containers)
- **CI/CD**: GitHub Actions with automated testing and deployment
- **Container Registry**: Google Artifact Registry
- **Region**: europe-west1 for optimal performance

## Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- Git

### Local Development

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/eediallo/Restaurant-Booking-App.git
   cd Restaurant-Booking-App
   ```

2. **Set Up Virtual Environment** (Recommended):

   ```bash
   # Create virtual environment
   python -m venv venv

   # Activate virtual environment
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Backend Setup**:

   ```bash
   # Install dependencies
   pip install -r requirements.txt

   # Initialize database and start development server
   python -m app
   ```

   Backend will be available at: http://localhost:8547

4. **Frontend Setup**:

   ```bash
   cd web
   npm install
   npm run dev
   ```

   Frontend will be available at: http://localhost:5173

5. **Full-Stack Development** (Docker):
   ```bash
   docker compose up
   ```
   Application will be available at: http://localhost:8547

### Production Deployment

The application is automatically deployed to Google Cloud Run via GitHub Actions on every push to the `main` branch.

**Live Application**: https://restaurant-booking-api-1015820699686.europe-west1.run.app

For manual deployment, see the [Deployment Guide](DEPLOYMENT.md).

## API Documentation

### Interactive Documentation

- **Production**: https://restaurant-booking-api-1015820699686.europe-west1.run.app/docs
- **Local Development**: http://localhost:8547/docs

### Key Endpoints

#### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Current user info

#### Restaurants

- `GET /api/restaurants` - Search restaurants with filters
- `GET /api/restaurants/{id}` - Get restaurant details by ID
- `GET /api/restaurants/name/{name}` - Get restaurant details by name
- `GET /api/restaurants/{id}/availability` - Check availability

#### User Management

- `GET /api/user/profile` - Get user profile
- `PATCH /api/user/profile` - Update user profile
- `GET /api/user/bookings` - Get user bookings
- `GET /api/user/bookings/history` - Get booking history

#### Bookings

- `POST /api/bookings` - Create new booking
- `GET /api/bookings/{id}` - Get booking details
- `PATCH /api/bookings/{id}` - Update booking
- `DELETE /api/bookings/{id}` - Cancel booking

## Testing

The application includes a comprehensive test suite:

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test categories
pytest tests/unit/          # Unit tests
pytest tests/integration/   # Integration tests
pytest tests/api/           # API tests
pytest tests/security/      # Security tests
```

**Test Coverage**:

- Unit tests for models and business logic
- Integration tests for complete workflows
- API tests for all endpoints
- Security tests for authentication and data validation

## Frontend Pages

### Public Pages

- **Landing Page**: Application overview and features
- **Restaurant Search**: Browse and search restaurants
- **Restaurant Details**: Detailed restaurant information
- **Login/Register**: User authentication

### Protected Pages

- **Dashboard**: User overview and quick actions
- **Booking Form**: Create new reservations
- **Booking History**: View past and upcoming bookings
- **User Profile**: Manage account settings and preferences

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Token Refresh**: Automatic token renewal
- **Input Validation**: Comprehensive data validation
- **SQL Injection Protection**: SQLAlchemy ORM prevents SQL injection
- **XSS Protection**: Input sanitization and validation

## Development

### Environment Variables

**Backend** (app/config.py):

- `SECRET_KEY`: JWT signing key
- `DATABASE_URL`: Database connection string
- `DEBUG`: Debug mode flag

**Frontend** (web/.env):

- `VITE_API_URL`: Backend API URL for development

### Code Quality

- **Linting**: ESLint for frontend, Python formatting standards
- **Type Safety**: Modern JavaScript with proper error handling
- **Git Hooks**: Pre-commit hooks for code quality
- **Documentation**: Comprehensive inline documentation

## Documentation

- **[Deployment Guide](DEPLOYMENT.md)**: Complete deployment instructions
- **[Server Documentation](SERVER.md)**: Backend architecture and setup
- **API Docs**: Auto-generated at `/docs` endpoint

## Recent Updates

- Restaurant Name-Based Routing: Direct access to restaurants by name
- Enhanced Authentication: Improved login/logout flow with better error handling
- Profile Management: Fixed profile update functionality
- Token Management: Robust token refresh and error handling
- Cloud Run Deployment: Optimized for Google Cloud Run with Artifact Registry
- Comprehensive Testing: Full test suite with multiple test categories

## Project Status

**Production Ready**

- Deployed and running on Google Cloud Run
- Automated CI/CD pipeline
- Comprehensive testing
- Mobile-responsive design
- Secure authentication system

---

**Built with FastAPI, React, and Google Cloud**
