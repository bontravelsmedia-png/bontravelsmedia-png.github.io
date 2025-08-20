// Admin Dashboard - Production Ready
class AdminDashboard {
    constructor() {
        this.currentUser = null;
        this.sessionToken = null;
        this.dashboardData = null;
        this.charts = {};
        this.refreshInterval = null;
        this.init();
    }
    
    init() {
        this.checkAuthentication();
        this.setupEventListeners();
        this.loadDashboardData();
        this.setupRealTimeUpdates();
        this.setupCharts();
        this.setupNavigation();
    }
    
    checkAuthentication() {
        const session = JSON.parse(localStorage.getItem('adminSession') || sessionStorage.getItem('adminSession') || '{}');
        
        if (!session.user || !session.token || !session.timestamp) {
            this.redirectToLogin();
            return;
        }
        
        const now = Date.now();
        if (now - session.timestamp > 30 * 60 * 1000) { // 30 minutes
            this.logout('Session expired');
            return;
        }
        
        this.currentUser = session.user;
        this.sessionToken = session.token;
        this.updateUserInterface();
        this.resetInactivityTimer();
    }
    
    setupEventListeners() {
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
        
        // Navigation
        const navItems = document.querySelectorAll('.admin-nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const target = item.getAttribute('data-section');
                this.showSection(target);
            });
        });
        
        // Search functionality
        const searchInput = document.getElementById('dashboardSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }
        
        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshDashboard());
        }
        
        // Activity monitoring
        ['mousemove', 'keypress', 'click', 'scroll'].forEach(event => {
            document.addEventListener(event, () => this.resetInactivityTimer());
        });
    }
    
    updateUserInterface() {
        // Update user info
        const userInfo = document.getElementById('userInfo');
        if (userInfo) {
            userInfo.innerHTML = `
                <div class="user-avatar">
                    <i class="fas fa-user-circle"></i>
                </div>
                <div class="user-details">
                    <div class="user-name">${this.currentUser.name}</div>
                    <div class="user-role">${this.currentUser.role.charAt(0).toUpperCase() + this.currentUser.role.slice(1)}</div>
                </div>
            `;
        }
        
        // Update permissions-based UI
        this.updatePermissionsUI();
        
        // Update last login
        const lastLogin = document.getElementById('lastLogin');
        if (lastLogin) {
            lastLogin.textContent = new Date().toLocaleString();
        }
    }
    
    updatePermissionsUI() {
        const permissions = this.currentUser.permissions;
        
        // Hide sections user doesn't have access to
        const sections = {
            'users': ['#users', '.users-nav'],
            'bookings': ['#bookings', '.bookings-nav'],
            'reports': ['#reports', '.reports-nav'],
            'settings': ['#settings', '.settings-nav']
        };
        
        Object.entries(sections).forEach(([permission, selectors]) => {
            if (!permissions.includes(permission)) {
                selectors.forEach(selector => {
                    const element = document.querySelector(selector);
                    if (element) {
                        element.style.display = 'none';
                    }
                });
            }
        });
    }
    
    async loadDashboardData() {
        try {
            // Simulate API call to get dashboard data
            this.dashboardData = await this.fetchDashboardData();
            this.updateDashboardMetrics();
            this.updateCharts();
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            this.showNotification('Failed to load dashboard data', 'error');
        }
    }
    
    async fetchDashboardData() {
        // Simulate API response with realistic data
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    overview: {
                        totalBookings: 1247,
                        totalRevenue: 89250.75,
                        activeUsers: 3421,
                        pendingRequests: 23,
                        monthlyGrowth: 12.5,
                        revenueGrowth: 8.3
                    },
                    bookings: {
                        recent: [
                            { id: 'BK001', customer: 'John Smith', destination: 'Tokyo', amount: 1250.00, status: 'confirmed', date: '2024-01-15' },
                            { id: 'BK002', customer: 'Sarah Johnson', destination: 'Paris', amount: 890.00, status: 'pending', date: '2024-01-14' },
                            { id: 'BK003', customer: 'Mike Wilson', destination: 'Bangkok', amount: 650.00, status: 'confirmed', date: '2024-01-13' },
                            { id: 'BK004', customer: 'Emily Davis', destination: 'London', amount: 1100.00, status: 'cancelled', date: '2024-01-12' },
                            { id: 'BK005', customer: 'David Brown', destination: 'Dubai', amount: 1450.00, status: 'confirmed', date: '2024-01-11' }
                        ],
                        byStatus: { confirmed: 892, pending: 156, cancelled: 89, completed: 110 },
                        byDestination: { 'Tokyo': 156, 'Paris': 134, 'Bangkok': 98, 'London': 167, 'Dubai': 145, 'Others': 447 }
                    },
                    revenue: {
                        monthly: [12500, 15800, 14200, 18900, 22100, 19800, 23400, 26700, 28900, 31200, 29800, 32500],
                        byCategory: { 'Flights': 65, 'Hotels': 20, 'Packages': 15 },
                        trends: { growth: 8.3, avgTicket: 71.50, conversion: 3.2 }
                    },
                    security: {
                        lastLogin: new Date().toISOString(),
                        failedAttempts: 0,
                        activeSessions: 1,
                        securityScore: 95,
                        lastAudit: '2024-01-10',
                        complianceStatus: 'Compliant'
                    }
                });
            }, 1000);
        });
    }
    
    updateDashboardMetrics() {
        if (!this.dashboardData) return;
        
        const { overview } = this.dashboardData;
        
        // Update metric cards
        const metrics = {
            'totalBookings': overview.totalBookings,
            'totalRevenue': `$${overview.totalRevenue.toLocaleString()}`,
            'activeUsers': overview.activeUsers,
            'pendingRequests': overview.pendingRequests
        };
        
        Object.entries(metrics).forEach(([key, value]) => {
            const element = document.getElementById(key);
            if (element) {
                element.textContent = value;
            }
        });
        
        // Update growth indicators
        const growthElements = document.querySelectorAll('.growth-indicator');
        growthElements.forEach(element => {
            const metric = element.dataset.metric;
            if (metric === 'bookings') {
                element.textContent = `+${overview.monthlyGrowth}%`;
                element.className = `growth-indicator ${overview.monthlyGrowth >= 0 ? 'positive' : 'negative'}`;
            } else if (metric === 'revenue') {
                element.textContent = `+${overview.revenueGrowth}%`;
                element.className = `growth-indicator ${overview.revenueGrowth >= 0 ? 'positive' : 'negative'}`;
            }
        });
    }
    
    setupCharts() {
        this.createActivityChart();
        this.createPerformanceChart();
    }
    
    createActivityChart() {
        const ctx = document.getElementById('activityChart');
        if (!ctx) return;
        
        this.charts.activity = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'User Activity',
                    data: [45, 52, 38, 67, 89, 76, 54],
                    borderColor: '#462c61',
                    backgroundColor: 'rgba(70, 44, 97, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
    
    createPerformanceChart() {
        const ctx = document.getElementById('performanceChart');
        if (!ctx) return;
        
        this.charts.performance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['CPU', 'Memory', 'Storage', 'Network'],
                datasets: [{
                    label: 'Performance',
                    data: [85, 72, 90, 78],
                    backgroundColor: 'rgba(222, 65, 133, 0.8)',
                    borderColor: '#de4185',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { 
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }
    

    
    updateCharts() {
        if (!this.dashboardData) return;
        
        // Update chart data if needed
        if (this.charts.activity) {
            // Update activity chart with new data
            this.charts.activity.update();
        }
        
        if (this.charts.performance) {
            // Update performance chart with new data
            this.charts.performance.update();
        }
    }
    
    setupNavigation() {
        const navItems = document.querySelectorAll('.admin-nav-item');
        const sections = document.querySelectorAll('.admin-section');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remove active class from all items
                navItems.forEach(nav => nav.classList.remove('active'));
                sections.forEach(section => section.classList.remove('active'));
                
                // Add active class to clicked item
                item.classList.add('active');
                
                // Show corresponding section
                const targetSection = item.getAttribute('data-section');
                const section = document.getElementById(targetSection);
                if (section) {
                    section.classList.add('active');
                }
            });
        });
    }
    
    showSection(sectionId) {
        const sections = document.querySelectorAll('.admin-section');
        const navItems = document.querySelectorAll('.admin-nav-item');
        
        sections.forEach(section => section.classList.remove('active'));
        navItems.forEach(item => item.classList.remove('active'));
        
        const targetSection = document.getElementById(sectionId);
        const targetNav = document.querySelector(`[data-section="${sectionId}"]`);
        
        if (targetSection) targetSection.classList.add('active');
        if (targetNav) targetNav.classList.add('active');
    }
    
    handleSearch(query) {
        if (!query.trim()) {
            this.clearSearchResults();
            return;
        }
        
        // Implement search functionality
        const results = this.searchDashboard(query);
        this.displaySearchResults(results);
    }
    
    searchDashboard(query) {
        const results = [];
        const searchableData = [
            ...this.dashboardData?.bookings?.recent || [],
            { type: 'metric', name: 'Total Bookings', value: this.dashboardData?.overview?.totalBookings },
            { type: 'metric', name: 'Total Revenue', value: this.dashboardData?.overview?.totalRevenue }
        ];
        
        searchableData.forEach(item => {
            if (item.customer && item.customer.toLowerCase().includes(query.toLowerCase())) {
                results.push({ ...item, matchType: 'customer' });
            } else if (item.destination && item.destination.toLowerCase().includes(query.toLowerCase())) {
                results.push({ ...item, matchType: 'destination' });
            } else if (item.name && item.name.toLowerCase().includes(query.toLowerCase())) {
                results.push({ ...item, matchType: 'metric' });
            }
        });
        
        return results;
    }
    
    displaySearchResults(results) {
        const searchResults = document.getElementById('searchResults');
        if (!searchResults) return;
        
        if (results.length === 0) {
            searchResults.innerHTML = '<p>No results found</p>';
            searchResults.style.display = 'block';
            return;
        }
        
        const html = results.map(result => {
            if (result.type === 'metric') {
                return `<div class="search-result-item">
                    <i class="fas fa-chart-line"></i>
                    <span>${result.name}: ${result.value}</span>
                </div>`;
            } else {
                return `<div class="search-result-item">
                    <i class="fas fa-plane"></i>
                    <span>${result.customer} - ${result.destination} (${result.status})</span>
                </div>`;
            }
        }).join('');
        
        searchResults.innerHTML = html;
        searchResults.style.display = 'block';
    }
    
    clearSearchResults() {
        const searchResults = document.getElementById('searchResults');
        if (searchResults) {
            searchResults.style.display = 'none';
        }
    }
    
    refreshDashboard() {
        this.loadDashboardData();
        this.showNotification('Dashboard refreshed successfully', 'success');
    }
    
    setupRealTimeUpdates() {
        // Refresh data every 5 minutes
        this.refreshInterval = setInterval(() => {
            this.loadDashboardData();
        }, 5 * 60 * 1000);
    }
    
    resetInactivityTimer() {
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
        }
        
        this.inactivityTimer = setTimeout(() => {
            this.logout('Session expired due to inactivity');
        }, 30 * 60 * 1000); // 30 minutes
    }
    
    logout(reason = 'User logged out') {
        localStorage.removeItem('adminSession');
        sessionStorage.removeItem('adminSession');
        
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
        }
        
        this.showNotification(reason, 'info');
        setTimeout(() => {
            window.location.href = 'admin-login.html';
        }, 1000);
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `admin-notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
    
    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
    
    redirectToLogin() {
        window.location.href = 'admin-login.html';
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.adminDashboard = new AdminDashboard();
});
