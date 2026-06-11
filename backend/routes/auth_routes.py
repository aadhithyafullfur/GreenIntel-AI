from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from models.user_model import UserCreate, UserLogin, Token, UserResponse
from services import auth_service
from utils.jwt_handler import create_access_token, verify_access_token
from typing import Optional

router = APIRouter(prefix="/api/auth", tags=["authentication"])
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Dependency to authenticate and return the current logged-in user from the JWT token.
    """
    token = credentials.credentials
    payload = verify_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials or token expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalid: user ID missing",
        )
    
    user = await auth_service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User associated with this token not found",
        )
    return user

@router.post("/signup", response_model=Token)
async def signup(user_data: UserCreate):
    """
    Creates a new user and returns a access token.
    """
    # Verify password confirm matches
    if user_data.password != user_data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match."
        )

    # Check if email is already taken
    existing_user = await auth_service.get_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # Save to database
    user = await auth_service.create_user(
        name=user_data.name,
        email=user_data.email,
        password_plain=user_data.password
    )

    # Generate access token
    access_token = create_access_token(data={"sub": user["_id"], "email": user["email"]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login", response_model=Token)
async def login(user_data: UserLogin):
    """
    Authenticates user and returns an access token.
    """
    user = await auth_service.authenticate_user(user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    access_token = create_access_token(data={"sub": user["_id"], "email": user["email"]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """
    Retrieves information about the current authenticated user.
    """
    return current_user

@router.post("/logout")
async def logout():
    """
    Logs out the user (client side destroys token, backend confirms).
    """
    return {"detail": "Logged out successfully"}
