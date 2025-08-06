// Dashboard JavaScript for dynamic data loading

// API base URL
const API_BASE = '/api';

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

// Update dashboard statistics
async function updateDashboardStats() {
    try {
        const response = await fetch(`${API_BASE}/stats`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Update stat cards
        document.querySelector('.stat-card:nth-child(1) .stat-number').textContent = formatNumber(data.total_products);
        document.querySelector('.stat-card:nth-child(2) .stat-number').textContent = formatNumber(data.low_stock_items);
        document.querySelector('.stat-card:nth-child(3) .stat-number').textContent = formatNumber(data.total_categories);
        document.querySelector('.stat-card:nth-child(4) .stat-number').textContent = formatNumber(data.out_of_stock);
        
        // Update inventory overview chart
        updateInventoryChart(data.categories);
        
        // Update recent activity
        updateRecentActivity(data.recent_activity);
        
        console.log('Dashboard stats updated successfully');
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        showErrorMessage('Failed to load dashboard data. Please refresh the page.');
    }
}

// Update inventory chart with real data
function updateInventoryChart(categories) {
    const chartContainer = document.querySelector('.chart-mock');
    if (!chartContainer) return;
    
    // Clear existing chart
    chartContainer.innerHTML = '';
    
    // Calculate total for percentages
    const total = Object.values(categories).reduce((sum, count) => sum + count, 0);
    
    // Create bars for each category
    Object.entries(categories).forEach(([category, count]) => {
        const percentage = total > 0 ? (count / total) * 100 : 0;
        const bar = document.createElement('div');
        bar.className = 'chart-bar';
        bar.style.height = `${Math.max(percentage, 10)}%`; // Minimum height for visibility
        bar.textContent = `${category} (${count})`;
        bar.title = `${category}: ${count} products (${percentage.toFixed(1)}%)`;
        chartContainer.appendChild(bar);
    });
}

// Update recent activity section
function updateRecentActivity(activities) {
    const activityList = document.querySelector('.activity-list');
    if (!activityList || !activities) return;
    
    // Clear existing activities
    activityList.innerHTML = '';
    
    // Add new activities
    activities.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <div class="activity-icon">${activity.icon}</div>
            <div class="activity-content">
                <h4>${activity.title}</h4>
                <p>${activity.description}</p>
                <span class="activity-time">${activity.time}</span>
            </div>
        `;
        activityList.appendChild(activityItem);
    });
}

// Show error message
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #fee2e2;
        color: #dc2626;
        padding: 1rem;
        border-radius: 8px;
        border: 1px solid #fecaca;
        z-index: 1000;
        max-width: 300px;
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    // Remove after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Quick action handlers
function setupQuickActions() {
    const addProductBtn = document.querySelector('.action-btn.primary');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            window.location.href = '/products';
        });
    }
    
    const generateReportBtn = document.querySelector('.action-btn.secondary');
    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', () => {
            window.location.href = '/reports';
        });
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard initializing...');
    
    // Load initial data
    updateDashboardStats();
    
    // Setup quick actions
    setupQuickActions();
    
    // Refresh data every 30 seconds
    setInterval(updateDashboardStats, 30000);
    
    console.log('Dashboard initialized successfully');
});

// Export functions for use in other scripts
window.DashboardAPI = {
    updateStats: updateDashboardStats,
    formatCurrency: formatCurrency,
    formatNumber: formatNumber
};
