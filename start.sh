#!/bin/bash

# Inventory Management System Startup Script

echo "Starting Inventory Management System..."
echo "======================================="

# Check if virtual environment exists
if [ ! -d "../inventory" ]; then
    echo "Virtual environment not found. Please run setup first."
    exit 1
fi

# Activate virtual environment and start the application
cd backend
echo "Starting Flask application..."
echo "The application will be available at: http://127.0.0.1:5000"
echo "Press Ctrl+C to stop the server"
echo ""

../inventory/bin/python app.py
