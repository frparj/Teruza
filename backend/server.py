from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import base64
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'teruza-hostel-secret-key-2025')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24 * 7  # 7 days

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Enums
class ProductType(str, Enum):
    product = "product"
    service = "service"

# Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    password_hash: str
    is_admin: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    token: str
    user: dict

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    active: bool = True
    featured: bool = False
    type: ProductType
    category: str
    price: float
    currency: str = "BRL"
    image_url: Optional[str] = None
    name_pt: str
    name_en: str
    name_es: str
    desc_pt: str
    desc_en: str
    desc_es: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    active: bool = True
    featured: bool = False
    type: ProductType
    category: str
    price: float
    currency: str = "BRL"
    image_url: Optional[str] = None
    name_pt: str
    name_en: str
    name_es: str
    desc_pt: str
    desc_en: str
    desc_es: str

class ProductUpdate(BaseModel):
    active: Optional[bool] = None
    featured: Optional[bool] = None
    type: Optional[ProductType] = None
    category: Optional[str] = None
    price: Optional[float] = None
    currency: Optional[str] = None
    image_url: Optional[str] = None
    name_pt: Optional[str] = None
    name_en: Optional[str] = None
    name_es: Optional[str] = None
    desc_pt: Optional[str] = None
    desc_en: Optional[str] = None
    desc_es: Optional[str] = None

class ImageUploadResponse(BaseModel):
    image_url: str

# Helper functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))

def create_token(user_id: str, email: str) -> str:
    payload = {
        'user_id': user_id,
        'email': email,
        'exp': datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({'id': payload['user_id']}, {'_id': 0, 'password_hash': 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Initialize default admin user
async def init_admin_user():
    admin_email = "admin@teruza.com"
    existing_admin = await db.users.find_one({'email': admin_email}, {'_id': 0})
    if not existing_admin:
        admin_user = User(
            email=admin_email,
            password_hash=hash_password("password123"),
            is_admin=True
        )
        doc = admin_user.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.users.insert_one(doc)
        logging.info(f"Default admin user created: {admin_email}")

# Auth Routes
@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({'email': credentials.email}, {'_id': 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_password(credentials.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_token(user['id'], user['email'])
    user_data = {k: v for k, v in user.items() if k != 'password_hash'}
    
    return TokenResponse(token=token, user=user_data)

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

# Product Routes
@api_router.get("/products", response_model=List[Product])
async def get_products(
    active_only: bool = True,
    category: Optional[str] = None,
    type: Optional[str] = None,
    featured: Optional[bool] = None
):
    query = {}
    if active_only:
        query['active'] = True
    if category:
        query['category'] = category
    if type:
        query['type'] = type
    if featured is not None:
        query['featured'] = featured
    
    products = await db.products.find(query, {'_id': 0}).to_list(1000)
    
    for product in products:
        if isinstance(product.get('created_at'), str):
            product['created_at'] = datetime.fromisoformat(product['created_at'])
        if isinstance(product.get('updated_at'), str):
            product['updated_at'] = datetime.fromisoformat(product['updated_at'])
    
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({'id': product_id}, {'_id': 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if isinstance(product.get('created_at'), str):
        product['created_at'] = datetime.fromisoformat(product['created_at'])
    if isinstance(product.get('updated_at'), str):
        product['updated_at'] = datetime.fromisoformat(product['updated_at'])
    
    return product

@api_router.post("/products", response_model=Product)
async def create_product(
    product_data: ProductCreate,
    current_user: dict = Depends(get_current_user)
):
    product = Product(**product_data.model_dump())
    doc = product.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.products.insert_one(doc)
    return product

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(
    product_id: str,
    product_data: ProductUpdate,
    current_user: dict = Depends(get_current_user)
):
    existing = await db.products.find_one({'id': product_id}, {'_id': 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = {k: v for k, v in product_data.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.products.update_one({'id': product_id}, {'$set': update_data})
    
    updated_product = await db.products.find_one({'id': product_id}, {'_id': 0})
    if isinstance(updated_product.get('created_at'), str):
        updated_product['created_at'] = datetime.fromisoformat(updated_product['created_at'])
    if isinstance(updated_product.get('updated_at'), str):
        updated_product['updated_at'] = datetime.fromisoformat(updated_product['updated_at'])
    
    return updated_product

@api_router.delete("/products/{product_id}")
async def delete_product(
    product_id: str,
    current_user: dict = Depends(get_current_user)
):
    result = await db.products.delete_one({'id': product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

@api_router.post("/products/upload-image", response_model=ImageUploadResponse)
async def upload_image(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Read file content and convert to base64
    content = await file.read()
    base64_image = base64.b64encode(content).decode('utf-8')
    image_url = f"data:{file.content_type};base64,{base64_image}"
    
    return ImageUploadResponse(image_url=image_url)

@api_router.get("/categories")
async def get_categories():
    categories = await db.products.distinct('category')
    return {"categories": categories}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    await init_admin_user()
    logger.info("Application started")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()