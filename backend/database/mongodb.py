import os
import sys
import logging
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# 2. Verify environment variables are loaded from .env before database initialization
# Resolve absolute path to .env file relative to this module
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(base_dir, ".env")
load_dotenv(env_path)

MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = "greenintel_ai"

# 3. Verify MONGODB_URI exists and log a clear startup message
if MONGODB_URI:
    print("✅ MONGODB_URI Loaded")
else:
    print("❌ MONGODB_URI Missing")

# Setup custom logging for database connection status
SUCCESS_LEVEL_NUM = 25
logging.addLevelName(SUCCESS_LEVEL_NUM, "SUCCESS")

def success(self, message, *args, **kws):
    if self.isEnabledFor(SUCCESS_LEVEL_NUM):
        self._log(SUCCESS_LEVEL_NUM, message, args, **kws)

logging.Logger.success = success

logger = logging.getLogger("greenintel.database")
logger.setLevel(logging.INFO)
if not logger.handlers:
    handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter("%(asctime)s - %(levelname)s - [%(name)s] - %(message)s")
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.propagate = False

client = None
db = None
is_connected = False
monitor_task = None

# Custom Database Offline Exception to handle errors gracefully
class DatabaseOfflineException(Exception):
    def __init__(self, message: str = "Database unavailable. Please try again later."):
        self.message = message
        super().__init__(self.message)

async def connect_to_mongo():
    """
    Connects to MongoDB Atlas, pings it, and initializes the database and monitoring loop.
    Prints the required connection statuses on success or failure.
    """
    global client, db, is_connected
    
    print("[DB] Connecting to MongoDB Atlas...")
    logger.info("[DB] Connecting to MongoDB Atlas...")
    
    if not MONGODB_URI:
        print("==================================================")
        print("❌ MongoDB Atlas Connection Failed")
        print("Reason: MONGODB_URI environment variable is missing.")
        print("==================================================")
        logger.error("[DB] MONGODB_URI environment variable is missing.")
        is_connected = False
        return False
        
    try:
        # 17. Configure timeouts and instantiate Client
        client = AsyncIOMotorClient(
            MONGODB_URI, 
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
            socketTimeoutMS=10000
        )
        
        # Verify connection by running a ping command (9. Remove fake connected states)
        await client.admin.command("ping")
        
        db = client[DB_NAME]
        is_connected = True
        
        print("[DB] Connection successful")
        print("[DB] Ping successful")
        logger.success(f"MongoDB Atlas Connected Successfully to database: {DB_NAME}")
        
        # 5. Print startup success banner
        print("==================================================")
        print("🚀 Starting GreenIntel AI Server")
        print("==================================================")
        print("✅ MongoDB Atlas Connected Successfully")
        print(f"📦 Database: {DB_NAME}")
        print("==================================================")
        
        # 13. Start background reconnection and connection monitoring task
        start_connection_monitor()
        
        return True
    except Exception as e:
        client = None
        db = None
        is_connected = False
        
        # 6. Print failure message
        print("==================================================")
        print("❌ MongoDB Atlas Connection Failed")
        print(f"Reason: {str(e)}")
        print("==================================================")
        logger.error(f"[DB] Connection failed: {str(e)}")
        return False

def start_connection_monitor():
    """
    Spawns the connection monitor task inside the current running event loop.
    """
    global monitor_task
    try:
        loop = asyncio.get_running_loop()
        if monitor_task is None or monitor_task.done():
            monitor_task = loop.create_task(monitor_connection_loop())
    except RuntimeError:
        pass

async def monitor_connection_loop():
    """
    Periodically checks connection to MongoDB Atlas, updating status and attempting reconnection.
    Logs using specific connection lost/reconnect patterns (14. Add detailed logging).
    """
    global client, db, is_connected
    while True:
        await asyncio.sleep(10)
        if client:
            try:
                # Fast check to see if cluster is still reachable
                await asyncio.wait_for(client.admin.command("ping"), timeout=3.0)
                if not is_connected:
                    print("[DB] Connection successful")
                    print("[DB] Ping successful")
                    logger.info("[DB] Connection restored successfully.")
                    is_connected = True
            except Exception:
                if is_connected:
                    print("[DB] Connection lost")
                    logger.warning("[DB] Connection lost")
                    is_connected = False
                
                print("[DB] Reconnecting...")
                logger.info("[DB] Reconnecting...")
                try:
                    client.close()
                    client = AsyncIOMotorClient(
                        MONGODB_URI, 
                        serverSelectionTimeoutMS=5000,
                        connectTimeoutMS=5000,
                        socketTimeoutMS=10000
                    )
                    await asyncio.wait_for(client.admin.command("ping"), timeout=5.0)
                    db = client[DB_NAME]
                    is_connected = True
                    print("[DB] Connection successful")
                    print("[DB] Ping successful")
                    logger.info("[DB] Connection restored successfully.")
                except Exception as ex:
                    logger.error(f"[DB] Reconnection attempt failed: {str(ex)}")

async def close_mongo_connection():
    """
    Gracefully closes the MongoDB client connection.
    """
    global client, db, is_connected
    if client:
        client.close()
        print("🔴 MongoDB Connection Closed")
        logger.info("🔴 MongoDB Connection Closed")
        client = None
        db = None
        is_connected = False

def get_database():
    global db
    return db

def check_connection():
    global is_connected
    return is_connected
