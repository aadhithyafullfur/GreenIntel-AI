import logging
from datetime import datetime
from bson import ObjectId
from fastapi import HTTPException, status
try:
    from backend.database.mongodb import get_database, check_connection, DatabaseOfflineException
except ImportError:
    from database.mongodb import get_database, check_connection, DatabaseOfflineException
from utils.jwt_handler import get_password_hash, verify_password

logger = logging.getLogger("greenintel.auth_service")

def verify_db_connected():
    """
    Verifies that MongoDB Atlas is active and accessible. If not, raises
    a DatabaseOfflineException immediately.
    """
    if not check_connection():
        logger.error("Database transaction rejected: MongoDB Atlas is disconnected.")
        raise DatabaseOfflineException()

async def get_user_by_email(email: str):
    """
    Retrieves a user document by their email address directly from MongoDB Atlas.
    """
    verify_db_connected()
    
    email_lower = email.lower()
    db = get_database()
    
    logger.info(f"Retrieving user details for email '{email_lower}' from MongoDB Atlas.")
    user = await db.users.find_one({"email": email_lower})
    if user:
        user["_id"] = str(user["_id"])
    return user

async def get_user_by_id(user_id: str):
    """
    Retrieves a user document by their unique ID directly from MongoDB Atlas.
    """
    verify_db_connected()
    
    db = get_database()
    logger.info(f"Retrieving user details for ID '{user_id}' from MongoDB Atlas.")
    
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if user:
            user["_id"] = str(user["_id"])
        return user
    except Exception as e:
        logger.error(f"Error querying user by ID {user_id} from MongoDB: {e}")
        return None

async def create_user(name: str, email: str, password_plain: str):
    """
    Registers a new user and inserts their document directly into MongoDB Atlas.
    """
    verify_db_connected()
    
    email_lower = email.lower()
    hashed_password = get_password_hash(password_plain)
    created_at_time = datetime.utcnow()

    user_doc = {
        "name": name,
        "email": email_lower,
        "password": hashed_password,
        "created_at": created_at_time.isoformat()
    }

    db = get_database()
    logger.info(f"Inserting new user '{email_lower}' into MongoDB Atlas 'users' collection.")
    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = str(result.inserted_id)
    return user_doc

async def authenticate_user(email: str, password_plain: str):
    """
    Authenticates a user by email and password using MongoDB credentials.
    """
    verify_db_connected()
    
    user = await get_user_by_email(email)
    if not user:
        logger.warning(f"Authentication failed: User '{email}' not found.")
        return None
    
    if verify_password(password_plain, user["password"]):
        logger.info(f"Authentication successful for user '{email}'.")
        return user
    
    logger.warning(f"Authentication failed: Incorrect password for user '{email}'.")
    return None
