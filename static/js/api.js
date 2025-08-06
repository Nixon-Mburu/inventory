// API utility functions for inventory management

class InventoryAPI {
    constructor() {
        this.baseURL = '/api';
    }

    // Generic API request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Get all products with optional filtering
    async getProducts(filters = {}) {
        const params = new URLSearchParams();
        if (filters.category) params.append('category', filters.category);
        if (filters.search) params.append('search', filters.search);
        if (filters.status) params.append('status', filters.status);
        
        const query = params.toString() ? `?${params.toString()}` : '';
        return this.request(`/products${query}`);
    }

    // Get single product
    async getProduct(id) {
        return this.request(`/products/${id}`);
    }

    // Create new product
    async createProduct(productData) {
        return this.request('/products', {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    }

    // Update product
    async updateProduct(id, productData) {
        return this.request(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(productData)
        });
    }

    // Delete product
    async deleteProduct(id) {
        return this.request(`/products/${id}`, {
            method: 'DELETE'
        });
    }

    // Get inventory statistics
    async getStats() {
        return this.request('/stats');
    }

    // Get low stock products
    async getLowStockProducts() {
        return this.request('/products/low-stock');
    }

    // Get recent activity
    async getRecentActivity() {
        return this.request('/activity');
    }
}

// Create global API instance
window.api = new InventoryAPI();
