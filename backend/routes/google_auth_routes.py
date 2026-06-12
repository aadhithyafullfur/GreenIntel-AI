import os
import logging
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests
from services import auth_service
from utils.jwt_handler import create_access_token
from typing import Optional

router = APIRouter(prefix="/api/auth", tags=["google-authentication"])
logger = logging.getLogger("greenintel.google_auth")

class GoogleLoginRequest(BaseModel):
    token: str

@router.post("/google")
async def google_login(request_data: GoogleLoginRequest):
    token = request_data.token
    google_client_id = os.getenv("GOOGLE_CLIENT_ID")
    
    if not google_client_id:
        logger.error("GOOGLE_CLIENT_ID is not configured in the environment.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google Authentication is not configured on the server."
        )

    # Detailed backend logging for auditing
    logger.info(f"Incoming Google Login request. Client ID: {google_client_id}")
    print(f"DEBUG: Incoming Google Token verification. Target Client ID: {google_client_id}")
    
    # Set generous clock skew (6 hours / 21600 seconds) to handle server timezone discrepancies (e.g. system clock in IST vs UTC)
    CLOCK_SKEW_SECONDS = 21600

    try:
        # Verify the Google credential token
        id_info = id_token.verify_oauth2_token(
            token, 
            requests.Request(), 
            google_client_id,
            clock_skew_in_seconds=CLOCK_SKEW_SECONDS
        )

        logger.info("Google verification success.")
        print(f"DEBUG: Google Verification Success. User claims: {id_info}")

        # Verify issuer
        if id_info.get("iss") not in ["accounts.google.com", "https://accounts.google.com"]:
            raise ValueError("Wrong issuer.")

        email = id_info.get("email")
        name = id_info.get("name")
        picture = id_info.get("picture")

        if not email:
            raise ValueError("Email not provided by Google.")

    except ValueError as e:
        logger.warning(f"Google token verification failed (ValueError): {e}")
        print(f"DEBUG: Google Verification ValueError: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token (ValueError): {str(e)}"
        )
    except Exception as e:
        logger.error(f"Error verifying Google token (Exception): {e}")
        print(f"DEBUG: Google Verification Exception: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not verify Google token (Exception): {str(e)}"
        )

    # Check if user already exists in the database
    user = await auth_service.get_user_by_email(email)
    
    if not user:
        # Create a new user with Google details
        user = await auth_service.create_google_user(
            name=name,
            email=email,
            profile_picture=picture
        )
        logger.info(f"Created new user {email} via Google OAuth.")
    else:
        # If the user exists, but doesn't have an auth_provider or profile picture set, update it
        db_updates = {}
        if not user.get("auth_provider"):
            db_updates["auth_provider"] = "google"
        if picture and not user.get("profile_picture"):
            db_updates["profile_picture"] = picture
            
        if db_updates:
            try:
                # Try import dynamically depending on backend structure
                try:
                    from backend.database.mongodb import get_database
                except ImportError:
                    from database.mongodb import get_database
                from bson import ObjectId
                
                db = get_database()
                await db.users.update_one(
                    {"_id": ObjectId(user["_id"])},
                    {"$set": db_updates}
                )
                user.update(db_updates)
                logger.info(f"Updated existing user {email} with Google details: {db_updates}")
            except Exception as update_err:
                logger.warning(f"Failed to update existing user with Google details: {update_err}")

    # Generate access token using the user's MongoDB ID
    access_token = create_access_token(data={"sub": user["_id"], "email": user["email"]})

    return {
        "success": True,
        "access_token": access_token,
        "user": {
            "name": user["name"],
            "email": user["email"],
            "picture": user.get("profile_picture") or picture
        }
    }
