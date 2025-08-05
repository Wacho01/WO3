// Main application logic
class AdminApp {
    constructor() {
        this.currentPage = 'dashboard';
        this.sidebarOpen = false;
    }
    
    async initialize() {
        // Show loading screen
        this.showLoading(true);
        
        // Initialize authentication
        const isAuthenticated = await window.authManager.initialize();
        
        if (!isAuthenticated) {
            this.showLoginForm();
            this.showLoading(false);
            return;
        }
        
        // Load the application
        await this.loadApp();
        this.showLoading(false);
    }
    
    async loadApp() {
        // Load components
        await this.loadHeader();
        await this.loadSidebar();
        
        // Load initial page
        await this.loadPage(this.currentPage);
        
        // Show the app
        document.getElementById('app').classList.remove('hidden');
        
        // Initialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }
    
    async loadHeader() {
        const headerContainer = document.getElementById('header-container');
        const user = window.authManager.getUser();
        
        headerContainer.innerHTML = `
            <header class="header">
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <button id="sidebar-toggle" class="btn btn-secondary mr-4 md:hidden">
                            <i data-lucide="menu" class="w-5 h-5"></i>
                        </button>
                        <h1 class="text-lg font-semibold">Admin Dashboard</h1>
                    </div>
                    <div class="flex items-center space-x-4">
                        <span class="text-sm text-gray-600 dark:text-gray-300">
                            Welcome, ${user?.email || 'Admin'}
                        </span>
                        <button id="logout-btn" class="btn btn-secondary">
                            <i data-lucide="log-out" class="w-4 h-4 mr-2"></i>
                            Logout
                        </button>
                    </div>
                </div>
            </header>
        `;
        
        // Add event listeners
        document.getElementById('logout-btn').addEventListener('click', () => this.logout());
        document.getElementById('sidebar-toggle')?.addEventListener('click', () => this.toggleSidebar());
    }
    
    async loadSidebar() {
        const sidebarContainer = document.getElementById('sidebar-container');
        
        sidebarContainer.innerHTML = `
            <aside class="sidebar ${this.sidebarOpen ? 'open' : ''}">
                <nav class="p-4">
                    <ul class="space-y-2">
                        <li>
                            <a href="#" data-page="dashboard" class="nav-link flex items-center p-3 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${this.currentPage === 'dashboard' ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : ''}">
                                <i data-lucide="layout-dashboard" class="w-5 h-5 mr-3"></i>
                                Dashboard
                            </a>
                        </li>
                        <li>
                            <a href="#" data-page="products" class="nav-link flex items-center p-3 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${this.currentPage === 'products' ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : ''}">
                                <i data-lucide="package" class="w-5 h-5 mr-3"></i>
                                Products
                            </a>
                        </li>
                        <li>
                            <a href="#" data-page="categories" class="nav-link flex items-center p-3 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${this.currentPage === 'categories' ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : ''}">
                                <i data-lucide="folder" class="w-5 h-5 mr-3"></i>
                                Categories
                            </a>
                        </li>
                        <li>
                            <a href="#" data-page="settings" class="nav-link flex items-center p-3 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${this.currentPage === 'settings' ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : ''}">
                                <i data-lucide="settings" class="w-5 h-5 mr-3"></i>
                                Settings
                            </a>
                        </li>
                    </ul>
                </nav>
            </aside>
        `;
        
        // Add navigation event listeners
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.currentTarget.getAttribute('data-page');
                this.navigateTo(page);
            });
        });
    }
    
    async loadPage(page) {
        const mainContent = document.getElementById('main-content');
        mainContent.className = 'main-content';
        
        let content = '';
        
        switch (page) {
            case 'dashboard':
                content = await this.loadDashboardPage();
                break;
            case 'products':
                content = await this.loadProductsPage();
                break;
            case 'categories':
                content = await this.loadCategoriesPage();
                break;
            case 'settings':
                content = await this.loadSettingsPage();
                break;
            default:
                content = '<div class="card"><h2>Page not found</h2></div>';
        }
        
        mainContent.innerHTML = content;
        
        // Initialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }
    
    async loadDashboardPage() {
        return `
            <div class="space-y-6">
                <h2 class="text-2xl font-bold">Dashboard</h2>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div class="card">
                        <div class="flex items-center">
                            <div class="p-3 bg-blue-100 dark:bg-blue-900 rounded-full mr-4">
                                <i data-lucide="package" class="w-6 h-6 text-blue-600 dark:text-blue-300"></i>
                            </div>
                            <div>
                                <p class="text-sm text-gray-600 dark:text-gray-400">Total Products</p>
                                <p class="text-2xl font-bold" id="total-products">-</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="flex items-center">
                            <div class="p-3 bg-green-100 dark:bg-green-900 rounded-full mr-4">
                                <i data-lucide="folder" class="w-6 h-6 text-green-600 dark:text-green-300"></i>
                            </div>
                            <div>
                                <p class="text-sm text-gray-600 dark:text-gray-400">Categories</p>
                                <p class="text-2xl font-bold" id="total-categories">-</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="flex items-center">
                            <div class="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full mr-4">
                                <i data-lucide="star" class="w-6 h-6 text-yellow-600 dark:text-yellow-300"></i>
                            </div>
                            <div>
                                <p class="text-sm text-gray-600 dark:text-gray-400">Featured</p>
                                <p class="text-2xl font-bold" id="featured-products">-</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="flex items-center">
                            <div class="p-3 bg-purple-100 dark:bg-purple-900 rounded-full mr-4">
                                <i data-lucide="eye" class="w-6 h-6 text-purple-600 dark:text-purple-300"></i>
                            </div>
                            <div>
                                <p class="text-sm text-gray-600 dark:text-gray-400">Total Views</p>
                                <p class="text-2xl font-bold" id="total-views">-</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <h3 class="text-lg font-semibold mb-4">Recent Activity</h3>
                    <div id="recent-activity">
                        <p class="text-gray-500 dark:text-gray-400">Loading...</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    async loadProductsPage() {
        return `
            <div class="space-y-6">
                <div class="flex justify-between items-center">
                    <h2 class="text-2xl font-bold">Products</h2>
                    <button class="btn btn-primary">
                        <i data-lucide="plus" class="w-4 h-4 mr-2"></i>
                        Add Product
                    </button>
                </div>
                
                <div class="card">
                    <div class="overflow-x-auto">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Category</th>
                                    <th>Status</th>
                                    <th>Views</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="products-table-body">
                                <tr>
                                    <td colspan="5" class="text-center py-8">
                                        <div class="loading-spinner"></div>
                                        <p class="mt-2 text-gray-500">Loading products...</p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }
    
    async loadCategoriesPage() {
        return `
            <div class="space-y-6">
                <div class="flex justify-between items-center">
                    <h2 class="text-2xl font-bold">Categories</h2>
                    <button class="btn btn-primary">
                        <i data-lucide="plus" class="w-4 h-4 mr-2"></i>
                        Add Category
                    </button>
                </div>
                
                <div class="card">
                    <div class="overflow-x-auto">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Status</th>
                                    <th>Sort Order</th>
                                    <th>Products</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="categories-table-body">
                                <tr>
                                    <td colspan="5" class="text-center py-8">
                                        <div class="loading-spinner"></div>
                                        <p class="mt-2 text-gray-500">Loading categories...</p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }
    
    async loadSettingsPage() {
        return `
            <div class="space-y-6">
                <h2 class="text-2xl font-bold">Settings</h2>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="card">
                        <h3 class="text-lg font-semibold mb-4">General Settings</h3>
                        <div class="space-y-4">
                            <div class="form-group">
                                <label class="form-label">Site Title</label>
                                <input type="text" class="form-input" value="Aquatic Play Equipment">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Site Description</label>
                                <textarea class="form-input" rows="3">Professional aquatic play equipment and water features</textarea>
                            </div>
                            <button class="btn btn-primary">Save Changes</button>
                        </div>
                    </div>
                    
                    <div class="card">
                        <h3 class="text-lg font-semibold mb-4">Theme Settings</h3>
                        <div class="space-y-4">
                            <div class="form-group">
                                <label class="form-label">Theme Mode</label>
                                <select class="form-input">
                                    <option>Light</option>
                                    <option>Dark</option>
                                    <option>Auto</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Primary Color</label>
                                <input type="color" class="form-input" value="#3b82f6">
                            </div>
                            <button class="btn btn-primary">Apply Theme</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    navigateTo(page) {
        this.currentPage = page;
        this.loadPage(page);
        this.loadSidebar(); // Refresh sidebar to update active state
    }
    
    toggleSidebar() {
        this.sidebarOpen = !this.sidebarOpen;
        const sidebar = document.querySelector('.sidebar');
        if (this.sidebarOpen) {
            sidebar.classList.add('open');
        } else {
            sidebar.classList.remove('open');
        }
    }
    
    showLoading(show) {
        const loadingScreen = document.getElementById('loading-screen');
        if (show) {
            loadingScreen.classList.remove('hidden');
        } else {
            loadingScreen.classList.add('hidden');
        }
    }
    
    showLoginForm() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div class="max-w-md w-full space-y-8">
                    <div class="text-center">
                        <h2 class="text-3xl font-bold">Admin Login</h2>
                        <p class="mt-2 text-gray-600 dark:text-gray-400">Sign in to access the dashboard</p>
                    </div>
                    <form id="login-form" class="card space-y-6">
                        <div class="form-group">
                            <label class="form-label">Email</label>
                            <input type="email" id="email" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Password</label>
                            <input type="password" id="password" class="form-input" required>
                        </div>
                        <button type="submit" class="btn btn-primary w-full">
                            Sign In
                        </button>
                    </form>
                </div>
            </div>
        `;
        
        app.classList.remove('hidden');
        
        // Add login form handler
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin();
        });
    }
    
    async handleLogin() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        const { error } = await window.authManager.signIn(email, password);
        
        if (error) {
            window.authManager.showError(error.message);
        } else {
            await this.loadApp();
        }
    }
    
    async logout() {
        await window.authManager.signOut();
        location.reload();
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const app = new AdminApp();
    app.initialize();
});