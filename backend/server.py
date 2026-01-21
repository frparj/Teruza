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

class Category(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name_pt: str
    name_en: str
    name_es: str
    image_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CategoryCreate(BaseModel):
    name_pt: str
    name_en: str
    name_es: str
    image_url: Optional[str] = None

class CategoryUpdate(BaseModel):
    name_pt: Optional[str] = None
    name_en: Optional[str] = None
    name_es: Optional[str] = None
    image_url: Optional[str] = None

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

# Initialize default categories
async def init_default_categories():
    default_categories = [
        {
            'name_pt': 'Bebidas',
            'name_en': 'Drinks',
            'name_es': 'Bebidas',
            'image_url': 'https://images.unsplash.com/photo-1632852521784-d85d5b62dd62'
        },
        {
            'name_pt': 'Snacks',
            'name_en': 'Snacks',
            'name_es': 'Snacks',
            'image_url': 'https://images.unsplash.com/photo-1641693148759-843d17ceac24'
        },
        {
            'name_pt': 'Refeições Rápidas',
            'name_en': 'Quick Meals',
            'name_es': 'Comidas Rápidas',
            'image_url': 'https://images.unsplash.com/photo-1762631884747-8dabb217e11b'
        },
        {
            'name_pt': 'Higiene',
            'name_en': 'Hygiene',
            'name_es': 'Higiene',
            'image_url': 'https://images.unsplash.com/photo-1750271336429-8b0a507785c0'
        },
        {
            'name_pt': 'Emergências',
            'name_en': 'Essentials',
            'name_es': 'Esenciales',
            'image_url': 'https://images.unsplash.com/photo-1564144573017-8dc932e0039e'
        },
        {
            'name_pt': 'Serviços',
            'name_en': 'Services',
            'name_es': 'Servicios',
            'image_url': 'https://images.unsplash.com/photo-1724847885015-be191f1a47ef'
        }
    ]
    
    for cat_data in default_categories:
        existing = await db.categories.find_one({'name_pt': cat_data['name_pt']}, {'_id': 0})
        if not existing:
            category = Category(**cat_data)
            doc = category.model_dump()
            doc['created_at'] = doc['created_at'].isoformat()
            doc['updated_at'] = doc['updated_at'].isoformat()
            await db.categories.insert_one(doc)
            logging.info(f"Default category created: {cat_data['name_pt']}")


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
    categories = await db.categories.find({}, {'_id': 0}).to_list(1000)
    
    for category in categories:
        if isinstance(category.get('created_at'), str):
            category['created_at'] = datetime.fromisoformat(category['created_at'])
        if isinstance(category.get('updated_at'), str):
            category['updated_at'] = datetime.fromisoformat(category['updated_at'])
    
    return categories

@api_router.post("/categories", response_model=Category)
async def create_category(
    category_data: CategoryCreate,
    current_user: dict = Depends(get_current_user)
):
    # Check if category name already exists
    existing = await db.categories.find_one({
        '$or': [
            {'name_pt': category_data.name_pt},
            {'name_en': category_data.name_en},
            {'name_es': category_data.name_es}
        ]
    }, {'_id': 0})
    
    if existing:
        raise HTTPException(status_code=400, detail="Category name already exists")
    
    category = Category(**category_data.model_dump())
    doc = category.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.categories.insert_one(doc)
    return category

@api_router.get("/categories/{category_id}", response_model=Category)
async def get_category(category_id: str):
    category = await db.categories.find_one({'id': category_id}, {'_id': 0})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    if isinstance(category.get('created_at'), str):
        category['created_at'] = datetime.fromisoformat(category['created_at'])
    if isinstance(category.get('updated_at'), str):
        category['updated_at'] = datetime.fromisoformat(category['updated_at'])
    
    return category

@api_router.put("/categories/{category_id}", response_model=Category)
async def update_category(
    category_id: str,
    category_data: CategoryUpdate,
    current_user: dict = Depends(get_current_user)
):
    existing = await db.categories.find_one({'id': category_id}, {'_id': 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Category not found")
    
    update_data = {k: v for k, v in category_data.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.categories.update_one({'id': category_id}, {'$set': update_data})
    
    updated_category = await db.categories.find_one({'id': category_id}, {'_id': 0})
    if isinstance(updated_category.get('created_at'), str):
        updated_category['created_at'] = datetime.fromisoformat(updated_category['created_at'])
    if isinstance(updated_category.get('updated_at'), str):
        updated_category['updated_at'] = datetime.fromisoformat(updated_category['updated_at'])
    
    return updated_category

@api_router.delete("/categories/{category_id}")
async def delete_category(
    category_id: str,
    current_user: dict = Depends(get_current_user)
):
    # Check if any products use this category
    category = await db.categories.find_one({'id': category_id}, {'_id': 0})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Get the category name to check products
    category_name_pt = category.get('name_pt')
    products_using_category = await db.products.count_documents({'category': category_name_pt})
    
    if products_using_category > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot delete category. {products_using_category} product(s) are using this category."
        )
    
    result = await db.categories.delete_one({'id': category_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return {"message": "Category deleted successfully"}

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