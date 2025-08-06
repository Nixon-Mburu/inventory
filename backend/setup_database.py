import psycopg2
import os
from dotenv import load_dotenv
import random
from decimal import Decimal
from urllib.parse import quote_plus
from urllib.parse import quote_plus

# Load environment variables
load_dotenv()

# Database connection parameters
DB_CONFIG = {
    'host': os.getenv('DB_HOST'),
    'port': os.getenv('DB_PORT'),
    'database': os.getenv('DB_NAME'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD')  # No need to encode for direct psycopg2 connection
}

def create_database_connection():
    """Create and return a database connection"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None

def create_products_table(conn):
    """Create the products table"""
    create_table_query = """
    CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        stock_quantity INTEGER NOT NULL DEFAULT 0,
        sku VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """
    
    try:
        cursor = conn.cursor()
        cursor.execute(create_table_query)
        conn.commit()
        print("Products table created successfully!")
        cursor.close()
    except Exception as e:
        print(f"Error creating table: {e}")
        conn.rollback()

def generate_dummy_products():
    """Generate 100 dummy products (25 for each category)"""
    categories = ['Electronics', 'Supplies', 'Furniture', 'Groceries']
    
    products_data = {
        'Electronics': [
            ('Wireless Headphones', 'Premium wireless headphones with noise cancellation'),
            ('Gaming Mouse', 'High-precision gaming mouse with RGB lighting'),
            ('Bluetooth Speaker', 'Portable Bluetooth speaker with excellent sound quality'),
            ('Smartphone Charger', 'Fast charging USB-C smartphone charger'),
            ('Laptop Stand', 'Adjustable aluminum laptop stand'),
            ('Webcam HD', 'Full HD 1080p webcam for video calls'),
            ('Wireless Keyboard', 'Compact wireless keyboard with backlight'),
            ('Power Bank', '20000mAh portable power bank'),
            ('USB Hub', '4-port USB 3.0 hub'),
            ('Monitor Cable', 'HDMI to DisplayPort cable 2m'),
            ('Phone Case', 'Protective silicone phone case'),
            ('Screen Protector', 'Tempered glass screen protector'),
            ('Tablet Stylus', 'Precision stylus for digital drawing'),
            ('Earbuds', 'True wireless earbuds with charging case'),
            ('Smart Watch', 'Fitness tracking smartwatch'),
            ('Memory Card', '64GB microSD card'),
            ('Cable Organizer', 'Desk cable management organizer'),
            ('Phone Holder', 'Adjustable phone stand'),
            ('Laptop Bag', 'Waterproof laptop carrying bag'),
            ('Wireless Charger', 'Qi wireless charging pad'),
            ('Bluetooth Adapter', 'USB Bluetooth 5.0 adapter'),
            ('External HDD', '1TB portable external hard drive'),
            ('Graphics Tablet', 'Digital drawing tablet'),
            ('Desk Lamp LED', 'USB powered LED desk lamp'),
            ('Gaming Headset', 'Professional gaming headset with microphone')
        ],
        'Supplies': [
            ('Ballpoint Pens', 'Pack of 12 blue ballpoint pens'),
            ('Sticky Notes', 'Colorful sticky note pads'),
            ('Printer Paper', 'A4 white printer paper 500 sheets'),
            ('Stapler', 'Heavy-duty office stapler'),
            ('Paper Clips', 'Box of 100 metal paper clips'),
            ('Highlighters', 'Set of 6 fluorescent highlighters'),
            ('Notebooks', 'Spiral bound lined notebooks'),
            ('Folders', 'Manila file folders pack of 25'),
            ('Scissors', 'Stainless steel office scissors'),
            ('Tape Dispenser', 'Desktop tape dispenser with tape'),
            ('Rubber Bands', 'Assorted rubber bands 1lb bag'),
            ('Binders', '3-ring binders 1 inch'),
            ('Correction Fluid', 'White correction fluid pen'),
            ('Markers', 'Permanent markers black pack of 12'),
            ('Calculator', 'Scientific calculator'),
            ('Hole Punch', '3-hole punch for documents'),
            ('Desk Organizer', 'Multi-compartment desk organizer'),
            ('Envelopes', 'White business envelopes pack of 100'),
            ('Labels', 'Address labels sheet pack'),
            ('Rubber Stamps', 'Custom rubber stamps set'),
            ('Pencils', 'No. 2 pencils pack of 24'),
            ('Erasers', 'Pink pearl erasers pack of 10'),
            ('Ruler', '12-inch plastic ruler'),
            ('Glue Sticks', 'School glue sticks pack of 6'),
            ('Index Cards', 'Ruled index cards 3x5 pack of 100')
        ],
        'Furniture': [
            ('Office Chair', 'Ergonomic office chair with lumbar support'),
            ('Desk', 'Modern computer desk with drawers'),
            ('Bookshelf', '5-tier wooden bookshelf'),
            ('Filing Cabinet', '4-drawer metal filing cabinet'),
            ('Coffee Table', 'Glass top coffee table'),
            ('Floor Lamp', 'Adjustable floor reading lamp'),
            ('Storage Ottoman', 'Fabric storage ottoman with lid'),
            ('Computer Stand', 'Mobile computer cart with wheels'),
            ('Coat Rack', 'Wooden coat rack stand'),
            ('Whiteboard', 'Magnetic dry erase whiteboard'),
            ('Waste Basket', 'Mesh metal waste basket'),
            ('Plant Stand', 'Bamboo plant display stand'),
            ('Shoe Rack', '3-tier shoe storage rack'),
            ('Monitor Riser', 'Wooden monitor stand with storage'),
            ('Side Table', 'Round side table with drawer'),
            ('Bar Stool', 'Adjustable height bar stool'),
            ('Folding Chair', 'Padded folding chair'),
            ('TV Stand', 'Entertainment center TV stand'),
            ('Nightstand', 'Bedside table with drawer'),
            ('Dresser', '6-drawer bedroom dresser'),
            ('Wardrobe', 'Portable clothes wardrobe'),
            ('Bench', 'Storage bench with cushion'),
            ('Desk Pad', 'Large leather desk mat'),
            ('Mirror', 'Full-length standing mirror'),
            ('Storage Box', 'Plastic storage container with lid')
        ],
        'Groceries': [
            ('Rice', 'Long grain white rice 5kg bag'),
            ('Cooking Oil', 'Vegetable cooking oil 2L bottle'),
            ('Sugar', 'Granulated white sugar 2kg'),
            ('Salt', 'Iodized table salt 1kg'),
            ('Flour', 'All-purpose wheat flour 2kg'),
            ('Tea Bags', 'Black tea bags pack of 100'),
            ('Coffee', 'Instant coffee jar 200g'),
            ('Milk Powder', 'Full cream milk powder 1kg'),
            ('Pasta', 'Spaghetti pasta 500g pack'),
            ('Canned Tomatoes', 'Diced tomatoes 400g can'),
            ('Bread', 'Whole wheat bread loaf'),
            ('Eggs', 'Fresh eggs dozen pack'),
            ('Onions', 'Yellow onions 2kg bag'),
            ('Potatoes', 'Irish potatoes 5kg bag'),
            ('Carrots', 'Fresh carrots 1kg bag'),
            ('Chicken', 'Frozen chicken pieces 1kg'),
            ('Fish', 'Frozen tilapia fillets 500g'),
            ('Beef', 'Lean ground beef 500g'),
            ('Cheese', 'Cheddar cheese block 250g'),
            ('Butter', 'Salted butter 500g pack'),
            ('Yogurt', 'Natural yogurt 500ml'),
            ('Bananas', 'Fresh bananas per kg'),
            ('Apples', 'Red apples per kg'),
            ('Oranges', 'Fresh oranges per kg'),
            ('Tomatoes', 'Fresh tomatoes per kg')
        ]
    }
    
    products = []
    
    for category in categories:
        for i, (name, description) in enumerate(products_data[category]):
            # Generate SKU
            sku = f"{category[:3].upper()}{str(i+1).zfill(3)}"
            
            # Generate random price in KSh (Kenyan Shillings)
            if category == 'Electronics':
                price = round(random.uniform(500, 15000), 2)
            elif category == 'Supplies':
                price = round(random.uniform(50, 1000), 2)
            elif category == 'Furniture':
                price = round(random.uniform(2000, 25000), 2)
            else:  # Groceries
                price = round(random.uniform(20, 500), 2)
            
            # Generate random stock quantity
            stock = random.randint(0, 100)
            
            products.append((name, category, price, stock, sku, description))
    
    return products

def insert_dummy_data(conn, products):
    """Insert dummy products into the database"""
    insert_query = """
    INSERT INTO products (name, category, price, stock_quantity, sku, description)
    VALUES (%s, %s, %s, %s, %s, %s)
    """
    
    try:
        cursor = conn.cursor()
        cursor.executemany(insert_query, products)
        conn.commit()
        print(f"Successfully inserted {len(products)} products!")
        cursor.close()
    except Exception as e:
        print(f"Error inserting data: {e}")
        conn.rollback()

def main():
    """Main function to set up database and load data"""
    print("Connecting to PostgreSQL database...")
    conn = create_database_connection()
    
    if conn:
        print("Connected successfully!")
        
        # Create products table
        create_products_table(conn)
        
        # Generate and insert dummy data
        print("Generating dummy products...")
        products = generate_dummy_products()
        
        print("Inserting products into database...")
        insert_dummy_data(conn, products)
        
        # Verify data was inserted
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM products")
        count = cursor.fetchone()[0]
        print(f"Total products in database: {count}")
        
        # Show category breakdown
        cursor.execute("SELECT category, COUNT(*) FROM products GROUP BY category ORDER BY category")
        categories = cursor.fetchall()
        print("\nProducts by category:")
        for category, count in categories:
            print(f"  {category}: {count} products")
        
        cursor.close()
        conn.close()
        print("\nDatabase setup completed successfully!")
    else:
        print("Failed to connect to database.")

if __name__ == "__main__":
    main()
