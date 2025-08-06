// Reports page functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeReportsPage();
});

async function initializeReportsPage() {
    await loadReportData();
    setupReportEventListeners();
}

function setupReportEventListeners() {
    // Generate report button
    const generateBtn = document.querySelector('.btn-primary');
    if (generateBtn) {
        generateBtn.addEventListener('click', generateReport);
    }
    
    // Export data button
    const exportBtn = document.querySelector('.btn-secondary');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportData);
    }
    
    // Filter change listeners
    const reportTypeFilter = document.getElementById('report-type');
    const dateRangeFilter = document.getElementById('date-range');
    const categoryFilter = document.getElementById('category');
    
    if (reportTypeFilter) {
        reportTypeFilter.addEventListener('change', handleFilterChange);
    }
    
    if (dateRangeFilter) {
        dateRangeFilter.addEventListener('change', handleFilterChange);
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', handleFilterChange);
    }
}

async function loadReportData() {
    try {
        // Load summary statistics
        await loadSummaryStats();
        
        // Load charts data
        await loadChartsData();
        
        // Load recent reports
        await loadRecentReports();
        
    } catch (error) {
        console.error('Error loading report data:', error);
        showNotification('Error loading report data', 'error');
    }
}

async function loadSummaryStats() {
    try {
        const stats = await window.api.getStats();
        
        // Calculate total value
        const products = await window.api.getProducts();
        const totalValue = products.reduce((sum, product) => {
            return sum + (product.price * product.stock_quantity);
        }, 0);
        
        // Update summary cards
        document.querySelector('[data-summary="total-products"] .summary-value').textContent = stats.total_products || 0;
        document.querySelector('[data-summary="total-value"] .summary-value').textContent = `KSh ${formatPrice(totalValue)}`;
        document.querySelector('[data-summary="low-stock"] .summary-value').textContent = stats.low_stock_items || 0;
        document.querySelector('[data-summary="out-of-stock"] .summary-value').textContent = stats.out_of_stock || 0;
        
    } catch (error) {
        console.error('Error loading summary stats:', error);
    }
}

async function loadChartsData() {
    try {
        const stats = await window.api.getStats();
        
        // Update inventory distribution chart
        updateInventoryChart(stats.categories || {});
        
        // Update stock movement trend (mock data for now)
        updateStockMovementChart();
        
    } catch (error) {
        console.error('Error loading charts data:', error);
    }
}

function updateInventoryChart(categories) {
    const chartContainer = document.querySelector('.pie-chart-mock');
    if (!chartContainer) return;
    
    const total = Object.values(categories).reduce((sum, count) => sum + count, 0);
    
    chartContainer.innerHTML = Object.entries(categories).map(([category, count]) => {
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
        return `<div class="chart-segment ${category.toLowerCase()}">${category} (${percentage}%)</div>`;
    }).join('');
}

function updateStockMovementChart() {
    // This would normally fetch real stock movement data
    // For now, we'll keep the existing mock chart
    console.log('Stock movement chart updated');
}

async function loadRecentReports() {
    try {
        // This would normally fetch from a reports table
        // For now, we'll generate some mock recent reports
        const reportsTable = document.querySelector('.reports-table tbody');
        if (!reportsTable) return;
        
        const mockReports = [
            {
                name: 'July Inventory Summary',
                type: 'Inventory',
                date: new Date().toISOString(),
                status: 'completed'
            },
            {
                name: 'Low Stock Alert Report',
                type: 'Stock Alert',
                date: new Date(Date.now() - 3600000).toISOString(),
                status: 'completed'
            },
            {
                name: 'Category Analysis',
                type: 'Analysis',
                date: new Date(Date.now() - 7200000).toISOString(),
                status: 'processing'
            }
        ];
        
        reportsTable.innerHTML = mockReports.map(report => `
            <tr>
                <td>${report.name}</td>
                <td>${report.type}</td>
                <td>${formatDateTime(report.date)}</td>
                <td><span class="status ${report.status}">${capitalizeFirst(report.status)}</span></td>
                <td>
                    <button class="btn-action view" ${report.status !== 'completed' ? 'disabled' : ''}>View</button>
                    <button class="btn-action download" ${report.status !== 'completed' ? 'disabled' : ''}>Download</button>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error loading recent reports:', error);
    }
}

async function generateReport() {
    const reportType = document.getElementById('report-type')?.value || 'inventory';
    const dateRange = document.getElementById('date-range')?.value || 'month';
    const category = document.getElementById('category')?.value || '';
    
    try {
        showNotification('Generating report...', 'info');
        
        // Simulate report generation
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // In a real implementation, this would call an API endpoint
        // await window.api.generateReport({ type: reportType, dateRange, category });
        
        showNotification('Report generated successfully!', 'success');
        await loadRecentReports();
        
    } catch (error) {
        console.error('Error generating report:', error);
        showNotification('Error generating report', 'error');
    }
}

async function exportData() {
    try {
        const products = await window.api.getProducts();
        
        // Convert to CSV
        const headers = ['SKU', 'Name', 'Category', 'Price (KSh)', 'Stock Quantity', 'Status'];
        const csvContent = [
            headers.join(','),
            ...products.map(product => [
                product.sku,
                `"${product.name}"`,
                product.category,
                product.price,
                product.stock_quantity,
                getStatusText(product.stock_quantity)
            ].join(','))
        ].join('\n');
        
        // Download CSV file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventory-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showNotification('Data exported successfully!', 'success');
        
    } catch (error) {
        console.error('Error exporting data:', error);
        showNotification('Error exporting data', 'error');
    }
}

async function handleFilterChange() {
    await loadReportData();
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

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-KE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
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
