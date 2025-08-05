// Supabase client initialization
let supabaseClient = null;

function initializeSupabase() {
    const supabaseUrl = window.VITE_SUPABASE_URL;
    const supabaseKey = window.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project') || supabaseKey.includes('your-anon-key')) {
        console.error('Supabase credentials not configured');
        return null;
    }
    
    try {
        supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
        return supabaseClient;
    } catch (error) {
        console.error('Failed to initialize Supabase:', error);
        return null;
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initializeSupabase();
});

// Export for use in other files
window.getSupabaseClient = () => supabaseClient;