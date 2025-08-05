// Authentication management
class AuthManager {
    constructor() {
        this.user = null;
        this.supabase = null;
    }
    
    async initialize() {
        this.supabase = window.getSupabaseClient();
        if (!this.supabase) {
            this.showError('Supabase not configured. Please set up your environment variables.');
            return false;
        }
        
        // Check current session
        const { data: { session } } = await this.supabase.auth.getSession();
        if (session) {
            this.user = session.user;
            return true;
        }
        
        return false;
    }
    
    async signIn(email, password) {
        if (!this.supabase) return { error: 'Supabase not initialized' };
        
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (data.user) {
            this.user = data.user;
        }
        
        return { data, error };
    }
    
    async signOut() {
        if (!this.supabase) return;
        
        const { error } = await this.supabase.auth.signOut();
        if (!error) {
            this.user = null;
        }
        return error;
    }
    
    isAuthenticated() {
        return !!this.user;
    }
    
    getUser() {
        return this.user;
    }
    
    showError(message) {
        const toast = document.createElement('div');
        toast.className = 'toast error';
        toast.innerHTML = `
            <div class="flex items-center">
                <i data-lucide="alert-circle" class="w-5 h-5 mr-2"></i>
                <span>${message}</span>
            </div>
        `;
        
        const container = document.getElementById('toast-container');
        container.appendChild(toast);
        
        // Initialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }
        
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }
}

// Global auth manager instance
window.authManager = new AuthManager();