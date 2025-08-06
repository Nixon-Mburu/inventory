from flask import Flask, jsonify, request, render_template
from models import app, db, Product
from sqlalchemy import or_
import os

@app.route('/')
def index():
    """Render the main dashboard page"""
    return render_template('index.html')

@app.route('/products')
def products():
    """Render the products page"""
    return render_template('product.html')

@app.route('/reports')
def reports():
    """Render the reports page"""
    return render_template('report.html')

@app.route('/api/home')
def api_home():
    return jsonify({
        'message': 'Inventory Management API',
        'status': 'running'
    })

@app.route('/api/products', methods=['GET'])
def get_products():
    """Get all products with optional filtering"""
    category = request.args.get('category')
    search = request.args.get('search')
    status = request.args.get('status')
    
    query = Product.query
    
    if category:
        query = query.filter(Product.category.ilike(f'%{category}%'))
    
    if search:
        query = query.filter(
            or_(
                Product.name.ilike(f'%{search}%'),
                Product.sku.ilike(f'%{search}%'),
                Product.description.ilike(f'%{search}%')
            )
        )
    
    if status:
        if status == 'low-stock':
            query = query.filter(Product.stock_quantity.between(1, 9))
        elif status == 'out-of-stock':
            query = query.filter(Product.stock_quantity == 0)
        elif status == 'in-stock':
            query = query.filter(Product.stock_quantity >= 10)
    
    products = query.order_by(Product.name).all()
    return jsonify([product.to_dict() for product in products])

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """Get a specific product by ID"""
    product = Product.query.get_or_404(product_id)
    return jsonify(product.to_dict())

@app.route('/api/products', methods=['POST'])
def create_product():
    """Create a new product"""
    data = request.get_json()
    
    product = Product(
        name=data['name'],
        category=data['category'],
        price=data['price'],
        stock_quantity=data.get('stock_quantity', 0),
        sku=data['sku'],
        description=data.get('description', '')
    )
    
    db.session.add(product)
    db.session.commit()
    
    return jsonify(product.to_dict()), 201

@app.route('/api/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    """Update a product"""
    product = Product.query.get_or_404(product_id)
    data = request.get_json()
    
    product.name = data.get('name', product.name)
    product.category = data.get('category', product.category)
    product.price = data.get('price', product.price)
    product.stock_quantity = data.get('stock_quantity', product.stock_quantity)
    product.sku = data.get('sku', product.sku)
    product.description = data.get('description', product.description)
    
    db.session.commit()
    
    return jsonify(product.to_dict())

@app.route('/api/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    """Delete a product"""
    product = Product.query.get_or_404(product_id)
    db.session.delete(product)
    db.session.commit()
    
    return jsonify({'message': 'Product deleted successfully'})

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get inventory statistics"""
    total_products = Product.query.count()
    low_stock = Product.query.filter(Product.stock_quantity < 10).count()
    out_of_stock = Product.query.filter(Product.stock_quantity == 0).count()
    
    # Get total categories count
    total_categories = db.session.query(Product.category).distinct().count()
    
    # Get category distribution for chart
    categories = db.session.query(Product.category, db.func.count(Product.id)).group_by(Product.category).all()
    category_stats = {category: count for category, count in categories}
    
    # Get recent activity (latest 5 products)
    recent_products = Product.query.order_by(Product.created_at.desc()).limit(5).all()
    recent_activity = []
    for product in recent_products:
        activity_type = "⚠️" if product.stock_quantity < 10 else "📦"
        message = f"Low stock alert - Only {product.stock_quantity} units left" if product.stock_quantity < 10 else "New product added"
        recent_activity.append({
            'icon': activity_type,
            'title': message,
            'description': f"{product.name} - SKU: {product.sku}",
            'time': product.created_at.strftime('%H:%M') if product.created_at else 'N/A'
        })
    
    # Calculate total inventory value
    total_value_result = db.session.query(db.func.sum(Product.price * Product.stock_quantity)).scalar()
    total_value = float(total_value_result) if total_value_result else 0
    
    return jsonify({
        'total_products': total_products,
        'low_stock_items': low_stock,
        'out_of_stock': out_of_stock,
        'total_categories': total_categories,
        'total_value': total_value,
        'categories': category_stats,
        'recent_activity': recent_activity
    })

@app.route('/api/products/low-stock', methods=['GET'])
def get_low_stock_products():
    """Get products with low stock (less than 10 units)"""
    products = Product.query.filter(Product.stock_quantity < 10).all()
    return jsonify([product.to_dict() for product in products])

@app.route('/api/activity', methods=['GET'])
def get_recent_activity():
    """Get recent activity (mock data for now)"""
    # In a real application, this would fetch from an activity log table
    activities = [
        {
            'type': 'product_added',
            'title': 'New product added',
            'description': 'Wireless Headphones - SKU: ELE001',
            'created_at': '2025-07-18T10:30:00Z'
        },
        {
            'type': 'low_stock',
            'title': 'Low stock alert',
            'description': 'Gaming Mouse - Only 3 units left',
            'created_at': '2025-07-18T08:15:00Z'
        },
        {
            'type': 'report_generated',
            'title': 'Monthly report generated',
            'description': 'July inventory summary completed',
            'created_at': '2025-07-17T14:20:00Z'
        }
    ]
    return jsonify(activities)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)