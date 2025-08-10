"""
Test configuration and fixtures.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from tests.factories import UserFactory, RestaurantFactory, BookingFactory, RestaurantReviewFactory


# Test database configuration
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """Create a test database session."""
    Base.metadata.create_all(bind=engine)
    
    session = TestingSessionLocal()
    
    # Configure factories to use this session
    UserFactory._meta.sqlalchemy_session = session
    RestaurantFactory._meta.sqlalchemy_session = session
    BookingFactory._meta.sqlalchemy_session = session
    RestaurantReviewFactory._meta.sqlalchemy_session = session
    
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


def override_get_db(db_session):
    """Override the database dependency."""
    def _override():
        try:
            yield db_session
        finally:
            pass
    return _override


@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with database override."""
    app.dependency_overrides[get_db] = override_get_db(db_session)
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()


@pytest.fixture
def sample_user(db_session):
    """Create a sample user for testing."""
    user = UserFactory(
        username="testuser",
        email="test@example.com",
        first_name="Test",
        last_name="User"
    )
    db_session.add(user)
    db_session.commit()
    return user


@pytest.fixture
def sample_restaurant(db_session):
    """Create a sample restaurant for testing."""
    restaurant = RestaurantFactory(
        name="Test Restaurant",
        address="123 Test Street",
        phone="555-0123"
    )
    db_session.add(restaurant)
    db_session.commit()
    return restaurant


@pytest.fixture
def sample_booking(db_session, sample_user, sample_restaurant):
    """Create a sample booking for testing."""
    booking = BookingFactory(
        user_id=sample_user.id,
        restaurant_id=sample_restaurant.id,
        booking_reference="TEST123",
        party_size=2
    )
    db_session.add(booking)
    db_session.commit()
    return booking


@pytest.fixture
def auth_headers(client):
    """Create authentication headers for testing."""
    # Register a test user
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpassword123",
        "first_name": "Test",
        "last_name": "User",
        "phone": "1234567890"
    }
    
    register_response = client.post("/api/auth/register", json=user_data)
    
    # Login to get token
    login_response = client.post("/api/auth/login", data={
        "username": "testuser",
        "password": "testpassword123"
    })
    
    if login_response.status_code == 200:
        token = login_response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}
    
    return {}


@pytest.fixture
def sample_booking_data():
    """Sample booking data for testing."""
    return {
        "VisitDate": "2025-08-15",
        "VisitTime": "19:00:00",
        "PartySize": "2",
        "ChannelCode": "ONLINE",
        "CustomerName": "Test Customer",
        "CustomerEmail": "customer@example.com",
        "CustomerPhone": "1234567890",
        "SpecialRequests": "Table by the window"
    }

import pytest
import pytest_asyncio
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient
from httpx import AsyncClient

from app.database import Base, get_db
from app.main import app
from app.models import User, Restaurant, Booking, Customer
from tests.factories import UserFactory, RestaurantFactory, BookingFactory


# Test database configuration
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override database dependency for testing."""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="session")
def test_engine():
    """Create test database engine."""
    return engine


@pytest.fixture(autouse=True)
def setup_database(test_engine):
    """Set up and tear down test database for each test."""
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def db_session():
    """Create a database session for testing."""
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client():
    """Create a test client."""
    return TestClient(app)


@pytest_asyncio.fixture
async def async_client():
    """Create an async test client."""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac


@pytest.fixture
def test_user(db_session):
    """Create a test user."""
    user = UserFactory.build()
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def test_restaurant(db_session):
    """Create a test restaurant."""
    restaurant = RestaurantFactory.build()
    db_session.add(restaurant)
    db_session.commit()
    db_session.refresh(restaurant)
    return restaurant


@pytest.fixture
def test_booking(db_session, test_user, test_restaurant):
    """Create a test booking."""
    booking = BookingFactory(user_id=test_user.id, restaurant_id=test_restaurant.id)
    db_session.add(booking)
    db_session.commit()
    db_session.refresh(booking)
    return booking


@pytest.fixture
def auth_headers(client, test_user):
    """Get authentication headers for API requests."""
    # Login to get token
    response = client.post(
        "/api/auth/login",
        data={
            "username": test_user.username,
            "password": "testpassword123"
        }
    )
    if response.status_code == 200:
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}
    return {}


@pytest.fixture
def sample_booking_data():
    """Sample booking data for testing."""
    return {
        "VisitDate": "2025-08-15",
        "VisitTime": "19:00:00",
        "PartySize": "2",
        "ChannelCode": "ONLINE",
        "SpecialRequests": "Window table please",
        "IsLeaveTimeConfirmed": "true",
        "Customer[FirstName]": "John",
        "Customer[Surname]": "Doe",
        "Customer[Email]": "john.doe@example.com",
        "Customer[Mobile]": "+1234567890"
    }
