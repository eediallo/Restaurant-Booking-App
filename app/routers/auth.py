"""
Authentication router for user registration, login, and token management.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app import models, auth
from app.database import get_db
from app.routers.user import get_current_user


class UserRegister(BaseModel):
    username: str
    email: str
    password: str
    first_name: str
    last_name: str
    phone: str


class UserLogin(BaseModel):
    username: str  # This will be treated as email
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    user_info: dict


class RefreshTokenRequest(BaseModel):
    refresh_token: str

router = APIRouter(prefix="/api/auth", tags=["authentication"])


@router.post("/register", response_model=TokenResponse)
def register_user(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user."""
    db_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    hashed_password = auth.get_password_hash(user_data.password)
    new_user = models.User(
        username=user_data.username, 
        email=user_data.email, 
        password_hash=hashed_password,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        phone=user_data.phone
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = auth.create_access_token(data={"sub": new_user.email})
    refresh_token = auth.create_refresh_token(data={"sub": new_user.email})

    return {
        "user_id": new_user.id,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user_info": {
            "username": new_user.username, 
            "email": new_user.email,
            "first_name": new_user.first_name,
            "last_name": new_user.last_name,
            "phone": new_user.phone
        },
    }


@router.post("/login", response_model=TokenResponse)
def login_for_access_token(login_data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return access token."""
    user = db.query(models.User).filter(models.User.email == login_data.username).first()
    if not user or not auth.verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if the account is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account has been deactivated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = auth.create_access_token(data={"sub": user.email})
    refresh_token = auth.create_refresh_token(data={"sub": user.email})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user_info": {"username": user.username, "email": user.email},
    }


@router.post("/refresh")
def refresh_access_token(token_data: RefreshTokenRequest):
    """
    Refresh an access token.
    """
    payload = auth.decode_token(token_data.refresh_token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )
    new_access_token = auth.create_access_token(data={"sub": payload["sub"]})
    return {"access_token": new_access_token}


@router.post("/logout")
def logout_user():
    """
    Logout user (client-side token removal).
    """
    return {"message": "Logged out successfully"}


@router.get("/me")
def get_current_user_info(current_user: models.User = Depends(get_current_user)):
    """
    Get current user information.
    """
    return {"username": current_user.username, "email": current_user.email, "id": current_user.id}
