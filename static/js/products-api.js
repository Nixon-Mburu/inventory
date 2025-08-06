// Products page JavaScript for dynamic data loading and search

// API base URL
const API_BASE = '/api';

// Global variables
let currentPage = 1;
let currentFilters = {
    search: '',
    category: '',
    status: ''
};

// Format currency in Kenyan Shillings
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 2
    }).format(amount).replace('KES', 'KSh');
}

// Format numbers with commas
function formatNumber(num) {
    return new Intl.NumberFormat('en-KE').format(num);
}

// Get stock status badge
function getStatusBadge(stockQuantity) {
    if (stockQuantity === 0) {
        return '<span class="status out-of-stock">Out of Stock</span>';
    } else if (stockQuantity <= 10) {
        return '<span class="status low-stock">Low Stock</span>';
    } else {
        return '<span class="status in-stock">In Stock</span>';
    }
}

// Load products with current filters
async function loadProducts(page = 1) {
    try {
        const params = new URLSearchParams({
            page: page,
            per_page: 10,
            ...currentFilters
        });
        
        // Remove empty filters
        for (const [key, value] of params.entries()) {
            if (!value) {
                params.delete(key);
            }
        }
        
        const response = await fetch(`${API_BASE}/products?${params}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        displayProducts(data.products || data); // Handle both paginated and non-paginated responses
        
        // Update pagination if available
        if (data.total !== undefined) {
            updatePagination(data);
        }
        
        console.log('Products loaded successfully');
    } catch (error) {
        console.error('Error loading products:', error);
        showErrorMessage('Failed to load products. Please try again.');
    }
}

// Display products in the table
function displayProducts(products) {
    const tbody = document.querySelector('.products-table tbody');
    if (!tbody) return;
    
    if (!products || products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem; color: #6b7280;">
                    No products found. Try adjusting your search criteria.
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = products.map(product => `
        <tr data-product-id="${product.id}">
            <td>${product.sku}</td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${formatCurrency(product.price)}</td>
            <td>${formatNumber(product.stock_quantity)}</td>
            <td>${getStatusBadge(product.stock_quantity)}</td>
            <td>
                <button class="btn-action edit" onclick="editProduct(${product.id})">Edit</button>
                <button class="btn-action delete" onclick="deleteProduct(${product.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Update pagination controls
function updatePagination(data) {
    const paginationContainer = document.querySelector('.pagination');
    if (!paginationContainer) return;
    
    const prevBtn = paginationContainer.querySelector('.page-btn:first-child');
    const nextBtn = paginationContainer.querySelector('.page-btn:last-child');
    const pageInfo = paginationContainer.querySelector('.page-info');
    
    if (prevBtn) {
        prevBtn.disabled = !data.has_prev;
        prevBtn.onclick = () => {
            if (data.has_prev) {
                currentPage = data.current_page - 1;
                loadProducts(currentPage);
            }
        };
    }
    
    if (nextBtn) {
        nextBtn.disabled = !data.has_next;
        nextBtn.onclick = () => {
            if (data.has_next) {
                currentPage = data.current_page + 1;
                loadProducts(currentPage);
            }
        };
    }
    
    if (pageInfo) {
        pageInfo.textContent = `Page ${data.current_page} of ${data.pages}`;
    }
}

// Setup search functionality
function setupSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    const categorySelect = document.querySelector('.filter-select:first-of-type');
    const statusSelect = document.querySelector('.filter-select:last-of-type');
    
    // Search input handler
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentFilters.search = e.target.value;
                currentPage = 1;
                loadProducts(currentPage);
            }, 500); // Debounce search
        });
    }
    
    // Search button handler
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            currentFilters.search = searchInput ? searchInput.value : '';
            currentPage = 1;
            loadProducts(currentPage);
        });
    }
    
    // Category filter handler
    if (categorySelect) {
        categorySelect.addEventListener('change', (e) => {
            currentFilters.category = e.target.value;
            currentPage = 1;
            loadProducts(currentPage);
        });
    }
    
    // Status filter handler
    if (statusSelect) {
        statusSelect.addEventListener('change', (e) => {
            currentFilters.status = e.target.value;
            currentPage = 1;
            loadProducts(currentPage);
        });
    }
}

// Edit product function
async function editProduct(productId) {
    try {
        const response = await fetch(`${API_BASE}/products/${productId}`);
        const product = await response.json();
        
        // For now, just show an alert with product details
        // In a real app, you'd open a modal or navigate to an edit form
        alert(`Editing product: ${product.name}\nSKU: ${product.sku}\nPrice: ${formatCurrency(product.price)}\nStock: ${product.stock_quantity}`);
        
    } catch (error) {
        console.error('Error fetching product:', error);
        showErrorMessage('Failed to load product details.');
    }
}

// Delete product function
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/products/${productId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        showSuccessMessage('Product deleted successfully');
        loadProducts(currentPage); // Reload current page
        
    } catch (error) {
        console.error('Error deleting product:', error);
        showErrorMessage('Failed to delete product. Please try again.');
    }
}

// Show error message
function showErrorMessage(message) {
    showMessage(message, 'error');
}

// Show success message
function showSuccessMessage(message) {
    showMessage(message, 'success');
}

// Show message (generic)
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-${type}`;
    
    const bgColor = type === 'error' ? '#fee2e2' : type === 'success' ? '#d1fae5' : '#e0f2fe';
    const textColor = type === 'error' ? '#dc2626' : type === 'success' ? '#059669' : '#0284c7';
    const borderColor = type === 'error' ? '#fecaca' : type === 'success' ? '#a7f3d0' : '#bae6fd';
    
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: ${bgColor};
        color: ${textColor};
        padding: 1rem;
        border-radius: 8px;
        border: 1px solid ${borderColor};
        z-index: 1000;
        max-width: 300px;
        font-family: 'Plus Jakarta Sans', sans-serif;
    `;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    // Remove after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Setup add product button
function setupAddProduct() {
    const addBtn = document.querySelector('.btn-primary');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            // For now, just show an alert
            // In a real app, you'd open a modal or navigate to an add form
            alert('Add Product functionality would open a form here');
        });
    }
}

// Initialize products page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Products page initializing...');
    
    // Load initial products
    loadProducts();
    
    // Setup search and filters
    setupSearch();
    
    // Setup add product button
    setupAddProduct();
    
    console.log('Products page initialized successfully');
});

// Export functions for global use
window.ProductsAPI = {
    loadProducts,
    editProduct,
    deleteProduct,
    formatCurrency,
    formatNumber
};
