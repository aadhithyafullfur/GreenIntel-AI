import os
import sys
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

# Setup Custom SUCCESS log level
SUCCESS_LEVEL_NUM = 25
logging.addLevelName(SUCCESS_LEVEL_NUM, "SUCCESS")

def success(self, message, *args, **kws):
    if self.isEnabledFor(SUCCESS_LEVEL_NUM):
        self._log(SUCCESS_LEVEL_NUM, message, args, **kws)

logging.Logger.success = success

# Configure GreenIntel database logger
logger = logging.getLogger("greenintel.database")
logger.setLevel(logging.INFO)
if not logger.handlers:
    handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter("%(asctime)s - %(levelname)s - [%(name)s] - %(message)s")
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.propagate = False

MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = "greenintel_ai"

client = None
db = None
is_connected = False

# Collections
users_collection = None
reports_collection = None
evaluations_collection = None

async def connect_to_mongo():
    """
    Connects to MongoDB Atlas asynchronously, verifies connection using ping,
    and initializes the database and collections references.
    """
    global client, db, is_connected, users_collection, reports_collection, evaluations_collection
    
    if not MONGODB_URI:
        error_msg = "MONGODB_URI environment variable is missing or empty in .env."
        print("==================================================")
        print("❌ MongoDB Connection Failed")
        print(f"Error: {error_msg}")
        print("=====================")
        logger.error(f"MongoDB Connection Failed: {error_msg}")
        is_connected = False
        return False
        
    try:
        # Create client and set serverSelectionTimeoutMS to 5 seconds
        client = AsyncIOMotorClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
        
        # Verify connection
        await client.admin.command("ping")
        
        db = client[DB_NAME]
        users_collection = db["users"]
        reports_collection = db["reports"]
        evaluations_collection = db["evaluations"]
        is_connected = True
        
        # Console output as requested
        print("==================================================")
        print("✅ MongoDB Atlas Connected Successfully")
        print(f"📂 Database: {DB_NAME}")
        print("==========================")
        
        logger.success(f"MongoDB Atlas Connected Successfully to database: {DB_NAME}")
        return True
    except Exception as e:
        client = None
        db = None
        users_collection = None
        reports_collection = None
        evaluations_collection = None
        is_connected = False
        
        # Console output as requested
        print("==================================================")
        print("❌ MongoDB Connection Failed")
        print(f"Error: {str(e)}")
        print("=====================")
        
        logger.error(f"MongoDB Connection Failed. Error: {str(e)}")
        return False

async def close_mongo_connection():
    """
    Closes the MongoDB connection gracefully.
    """
    global client, db, is_connected, users_collection, reports_collection, evaluations_collection
    if client:
        client.close()
        print("🔴 MongoDB Connection Closed")
        logger.info("🔴 MongoDB Connection Closed")
        client = None
        db = None
        users_collection = None
        reports_collection = None
        evaluations_collection = None
        is_connected = False

def get_database():
    global db
    return db

def check_connection():
    global is_connected
    return is_connected
