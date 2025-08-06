// Dashboard functionality
document.addEventListener('DOMContentLoaded', async function() {
    await loadDashboardData();
    
    // Refresh data every 30 seconds
    setInterval(loadDashboardData, 30000);
});

async function loadDashboardData() {
    try {
        // Load statistics
        await loadStatistics();
        
        // Load recent activity
        await loadRecentActivity();
        
        // Load inventory overview
        await loadInventoryOverview();
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Error loading dashboard data', 'error');
    }
}

async function loadStatistics() {
    try {
        const stats = await window.api.getStats();
        
        // Update statistics cards
        document.querySelector('[data-stat="total-products"] .stat-number').textContent = stats.total_products || 0;
        document.querySelector('[data-stat="low-stock"] .stat-number').textContent = stats.low_stock_items || 0;
        document.querySelector('[data-stat="categories"] .stat-number').textContent = Object.keys(stats.categories || {}).length;
        document.querySelector('[data-stat="out-of-stock"] .stat-number').textContent = stats.out_of_stock || 0;
        
        // Update category chart
        updateCategoryChart(stats.categories || {});
        
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

async function loadRecentActivity() {
    try {
        const activity = await window.api.getRecentActivity();
        const activityList = document.querySelector('.activity-list');
        
        if (activity && activity.length > 0) {
            activityList.innerHTML = activity.map(item => `
                <div class="activity-item">
                    <div class="activity-icon">${getActivityIcon(item.type)}</div>
                    <div class="activity-content">
                        <h4>${item.title}</h4>
                        <p>${item.description}</p>
                        <span class="activity-time">${formatTimeAgo(item.created_at)}</span>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading recent activity:', error);
    }
}

async function loadInventoryOverview() {
    try {
        const stats = await window.api.getStats();
        updateCategoryChart(stats.categories || {});
    } catch (error) {
        console.error('Error loading inventory overview:', error);
    }
}

function updateCategoryChart(categories) {
    const chartContainer = document.querySelector('.chart-mock');
    if (!chartContainer) return;
    
    const total = Object.values(categories).reduce((sum, count) => sum + count, 0);
    
    chartContainer.innerHTML = Object.entries(categories).map(([category, count]) => {
        const percentage = total > 0 ? (count / total * 100) : 0;
        return `<div class="chart-bar" style="height: ${Math.max(percentage, 10)}%">${category}</div>`;
    }).join('');
}

function getActivityIcon(type) {
    const icons = {
        'product_added': '📦',
        'low_stock': '⚠️',
        'report_generated': '📊',
        'product_updated': '✏️',
        'product_deleted': '🗑️'
    };
    return icons[type] || '📋';
}

function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
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
