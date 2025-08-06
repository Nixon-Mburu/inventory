// Products page functionality
let currentProducts = [];
let currentPage = 1;
const productsPerPage = 10;

document.addEventListener('DOMContentLoaded', function() {
    initializeProductsPage();
});

async function initializeProductsPage() {
    // Load initial products
    await loadProducts();
    
    // Setup event listeners
    setupEventListeners();
}

function setupEventListeners() {
    // Search functionality
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    
    // Filter functionality
    const categoryFilter = document.querySelector('select[name="category"]');
    const statusFilter = document.querySelector('select[name="status"]');
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', handleFilterChange);
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', handleFilterChange);
    }
    
    // Add new product button
    const addProductBtn = document.querySelector('.btn-primary');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', showAddProductModal);
    }
}

async function loadProducts(filters = {}) {
    try {
        const products = await window.api.getProducts(filters);
        currentProducts = products;
        renderProductsTable(products);
        updatePagination(products.length);
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Error loading products', 'error');
    }
}

function renderProductsTable(products) {
    const tbody = document.querySelector('.products-table tbody');
    if (!tbody) return;
    
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const pageProducts = products.slice(startIndex, endIndex);
    
    tbody.innerHTML = pageProducts.map(product => `
        <tr data-product-id="${product.id}">
            <td>${product.sku}</td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>KSh ${formatPrice(product.price)}</td>
            <td>${product.stock_quantity}</td>
            <td><span class="status ${getStatusClass(product.stock_quantity)}">${getStatusText(product.stock_quantity)}</span></td>
            <td>
                <button class="btn-action edit" onclick="editProduct(${product.id})">Edit</button>
                <button class="btn-action delete" onclick="deleteProduct(${product.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

function getStatusClass(stock) {
    if (stock === 0) return 'out-of-stock';
    if (stock < 10) return 'low-stock';
    return 'in-stock';
}

function getStatusText(stock) {
    if (stock === 0) return 'Out of Stock';
    if (stock < 10) return 'Low Stock';
    return 'In Stock';
}

function formatPrice(price) {
    return new Intl.NumberFormat('en-KE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(price);
}

async function handleSearch(event) {
    const searchTerm = event.target.value.trim();
    const filters = getActiveFilters();
    filters.search = searchTerm;
    await loadProducts(filters);
}

async function handleFilterChange() {
    const filters = getActiveFilters();
    await loadProducts(filters);
}

function getActiveFilters() {
    const categoryFilter = document.querySelector('select[name="category"]');
    const statusFilter = document.querySelector('select[name="status"]');
    const searchInput = document.querySelector('.search-input');
    
    return {
        category: categoryFilter?.value || '',
        status: statusFilter?.value || '',
        search: searchInput?.value || ''
    };
}

async function editProduct(productId) {
    try {
        const product = await window.api.getProduct(productId);
        showEditProductModal(product);
    } catch (error) {
        console.error('Error loading product for edit:', error);
        showNotification('Error loading product details', 'error');
    }
}

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    try {
        await window.api.deleteProduct(productId);
        showNotification('Product deleted successfully', 'success');
        await loadProducts(getActiveFilters());
    } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('Error deleting product', 'error');
    }
}

function showAddProductModal() {
    const modal = createProductModal();
    document.body.appendChild(modal);
}

function showEditProductModal(product) {
    const modal = createProductModal(product);
    document.body.appendChild(modal);
}

function createProductModal(product = null) {
    const isEdit = product !== null;
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h2>${isEdit ? 'Edit Product' : 'Add New Product'}</h2>
                <button class="modal-close" onclick="closeModal(this)">&times;</button>
            </div>
            <form class="modal-body" onsubmit="handleProductSubmit(event, ${isEdit ? product.id : 'null'})">
                <div class="form-group">
                    <label for="product-name">Product Name</label>
                    <input type="text" id="product-name" name="name" value="${product?.name || ''}" required>
                </div>
                <div class="form-group">
                    <label for="product-category">Category</label>
                    <select id="product-category" name="category" required>
                        <option value="">Select Category</option>
                        <option value="Electronics" ${product?.category === 'Electronics' ? 'selected' : ''}>Electronics</option>
                        <option value="Supplies" ${product?.category === 'Supplies' ? 'selected' : ''}>Supplies</option>
                        <option value="Furniture" ${product?.category === 'Furniture' ? 'selected' : ''}>Furniture</option>
                        <option value="Groceries" ${product?.category === 'Groceries' ? 'selected' : ''}>Groceries</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="product-price">Price (KSh)</label>
                    <input type="number" id="product-price" name="price" step="0.01" min="0" value="${product?.price || ''}" required>
                </div>
                <div class="form-group">
                    <label for="product-stock">Stock Quantity</label>
                    <input type="number" id="product-stock" name="stock_quantity" min="0" value="${product?.stock_quantity || ''}" required>
                </div>
                <div class="form-group">
                    <label for="product-sku">SKU</label>
                    <input type="text" id="product-sku" name="sku" value="${product?.sku || ''}" required>
                </div>
                <div class="form-group">
                    <label for="product-description">Description</label>
                    <textarea id="product-description" name="description" rows="3">${product?.description || ''}</textarea>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" onclick="closeModal(this)">Cancel</button>
                    <button type="submit" class="btn-primary">${isEdit ? 'Update' : 'Add'} Product</button>
                </div>
            </form>
        </div>
    `;
    
    return modal;
}

async function handleProductSubmit(event, productId) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const productData = {
        name: formData.get('name'),
        category: formData.get('category'),
        price: parseFloat(formData.get('price')),
        stock_quantity: parseInt(formData.get('stock_quantity')),
        sku: formData.get('sku'),
        description: formData.get('description') || ''
    };
    
    try {
        if (productId) {
            await window.api.updateProduct(productId, productData);
            showNotification('Product updated successfully', 'success');
        } else {
            await window.api.createProduct(productData);
            showNotification('Product added successfully', 'success');
        }
        
        closeModal(event.target);
        await loadProducts(getActiveFilters());
    } catch (error) {
        console.error('Error saving product:', error);
        showNotification('Error saving product', 'error');
    }
}

function closeModal(element) {
    const modal = element.closest('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

function updatePagination(totalProducts) {
    const totalPages = Math.ceil(totalProducts / productsPerPage);
    const pageInfo = document.querySelector('.page-info');
    const prevBtn = document.querySelector('.page-btn:first-child');
    const nextBtn = document.querySelector('.page-btn:last-child');
    
    if (pageInfo) {
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    }
    
    if (prevBtn) {
        prevBtn.disabled = currentPage === 1;
        prevBtn.onclick = () => changePage(currentPage - 1);
    }
    
    if (nextBtn) {
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.onclick = () => changePage(currentPage + 1);
    }
}

async function changePage(page) {
    currentPage = page;
    renderProductsTable(currentProducts);
    updatePagination(currentProducts.length);
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
