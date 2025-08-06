# Inventory Management System

A modern web-based inventory management system built with Flask and PostgreSQL, featuring a clean interface with Kenyan Shilling currency support.

## Features

- **Dashboard**: Overview of inventory statistics and recent activity
- **Products**: Manage products across 4 categories (Electronics, Supplies, Furniture, Groceries)
- **Reports**: Generate and view inventory reports with charts
- **Currency**: All prices displayed in Kenyan Shillings (KSh)
- **Database**: PostgreSQL with 100 sample products pre-loaded

## Categories

- **Electronics**: Gadgets, accessories, and tech items
- **Supplies**: Office and school supplies
- **Furniture**: Office and home furniture
- **Groceries**: Food and household items

## Quick Start

### Prerequisites
- Python 3.x
- PostgreSQL
- Virtual environment (already set up)


### Running the Application

1. **Start the server:**
   ```bash
   ./start.sh
   ```

2. **Or manually:**
   ```bash
   cd backend
   ../inventory/bin/python app.py
   ```

3. **Open your browser and go to:**
   ```
   http://127.0.0.1:5000
   ```

## Application Structure

```
inventory/
├── backend/
│   ├── app.py              # Main Flask application
│   ├── models.py           # Database models
│   ├── setup_database.py   # Database setup script
│   └── requirements.txt    # Python dependencies
├── templates/
│   ├── index.html          # Dashboard page
│   ├── product.html        # Products page
│   └── report.html         # Reports page
├── static/
│   └── styles/
│       ├── index.css       # Dashboard styles
│       ├── product.css     # Products styles
│       └── report.css      # Reports styles
├── .env                    # Database configuration
└── start.sh               # Startup script
```

## API Endpoints

- `GET /` - Dashboard page
- `GET /products` - Products page  
- `GET /reports` - Reports page
- `GET /api/products` - Get all products (JSON)
- `GET /api/products/<id>` - Get specific product (JSON)
- `POST /api/products` - Create new product (JSON)
- `PUT /api/products/<id>` - Update product (JSON)
- `DELETE /api/products/<id>` - Delete product (JSON)
- `GET /api/stats` - Get inventory statistics (JSON)

## Database Schema

### Products Table
- `id` - Primary key
- `name` - Product name
- `category` - Product category (Electronics, Supplies, Furniture, Groceries)
- `price` - Price in Kenyan Shillings
- `stock_quantity` - Current stock level
- `sku` - Stock Keeping Unit (unique identifier)
- `description` - Product description
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## Development

### Adding New Products
Use the API endpoints or directly insert into the database:

```python
from models import app, db, Product

with app.app_context():
    product = Product(
        name="New Product",
        category="Electronics",
        price=1500.00,
        stock_quantity=50,
        sku="ELE026",
        description="A new electronic product"
    )
    db.session.add(product)
    db.session.commit()
```

### Resetting Database
To reload sample data:
```bash
cd backend
../inventory/bin/python setup_database.py
```

## Technologies Used

- **Backend**: Flask, SQLAlchemy, PostgreSQL
- **Frontend**: HTML5, CSS3, Plus Jakarta Sans font
- **Database**: PostgreSQL with psycopg2
- **Environment**: Python virtual environment

## Currency Format

All prices are displayed in Kenyan Shillings using the format:
- `KSh 1,500.00` for the frontend
- Stored as DECIMAL(10,2) in the database

---

