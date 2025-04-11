import os
from dotenv import load_dotenv  # type: ignore

# ✅ Load environment variables from .env
load_dotenv()

class Config:
    # ✅ Database config
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # ✅ Flask app settings
    FLASK_ENV = os.getenv("FLASK_ENV", "development")  
    SECRET_KEY = os.getenv("SECRET_KEY", "default_secret_key")

    # ✅ JWT config
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your_jwt_secret_key")
    JWT_TOKEN_LOCATION = ["cookies"]
    JWT_ACCESS_COOKIE_PATH = "/"
    JWT_COOKIE_SECURE = False  # True if using HTTPS
    JWT_COOKIE_SAMESITE = "Lax"
    JWT_COOKIE_CSRF_PROTECT = False  # 🔁 Temporarily set to False for testing
    JWT_CSRF_IN_COOKIES = True
    JWT_ACCESS_CSRF_HEADER_NAME = "X-CSRF-TOKEN"
