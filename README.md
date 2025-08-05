# Aquatic Play Equipment Digital Catalog

A modern, responsive digital catalog for aquatic play equipment with a comprehensive admin dashboard.

## Features

### Public Catalog
- **Animated Intro Splash** - Beautiful branded introduction sequence
- **Category Filtering** - Filter products by category with visual feedback
- **Advanced Search** - Real-time search across product titles and descriptions
- **Responsive Design** - Optimized for all device sizes
- **Product Cards** - Interactive product displays with hover effects

### Admin Dashboard
- **Authentication** - Secure login system using Supabase Auth
- **Dashboard Overview** - Key statistics and recent products
- **Product Management** - Full CRUD operations for products
- **Category Management** - Manage product categories and filters
- **Status Controls** - Publish/unpublish products and toggle featured status
- **Image Management** - URL-based image handling with preview
- **Search & Filter** - Admin-side search and filtering capabilities

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Routing**: React Router DOM
- **Build Tool**: Vite

## Database Schema

### Categories Table
- `id` (text) - Unique category identifier
- `label` (text) - Display name for the category
- `disabled` (boolean) - Whether category is hidden from filters
- `sort_order` (integer) - Display order in filters
- `created_at` / `updated_at` (timestamp)

### Products Table
- `id` (uuid) - Unique product identifier
- `title` (text) - Product name
- `subtitle` (text) - Product description/type
- `image` (text) - Product image URL
- `category_id` (text) - Foreign key to categories
- `href` (text) - Link to product details
- `featured` (boolean) - Whether product is featured
- `active` (boolean) - Whether product is publicly visible
- `sort_order` (integer) - Display order
- `created_at` / `updated_at` (timestamp)

### Users Table
- `id` (uuid) - Links to Supabase Auth user
- `email` (text) - User email address
- `role` (text) - User role (admin)
- `created_at` / `updated_at` (timestamp)

## Setup Instructions

### 1. Supabase Setup
1. Create a new Supabase project
2. Run the migration files in order:
   - `supabase/migrations/20250703152804_shy_disk.sql`
   - `supabase/migrations/create_admin_user.sql`

### 2. Environment Variables
Create a `.env` file with your Supabase credentials:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Create Admin User
1. Go to your Supabase Dashboard
2. Navigate to Authentication > Users
3. Click "Add user"
4. Enter email and secure password
5. Set "Email Confirm" to true

### 4. Install Dependencies
```bash
npm install
```

### 5. Start Development Server
```bash
npm run dev
```

## Usage

### Public Catalog
- Visit the root URL to view the product catalog
- Use category filters to browse by product type
- Search for specific products using the search bar
- Click on products to view details (if href is provided)

### Admin Dashboard
- Visit `/admin` to access the admin dashboard
- Sign in with your admin credentials
- Use the dashboard to:
  - View statistics and recent products
  - Add, edit, or delete products
  - Manage categories
  - Toggle product visibility and featured status

## Admin Dashboard Features

### Dashboard Tab
- Overview statistics (total products, active products, featured products, categories)
- Recent products list with status indicators
- Quick access to product management

### Products Tab
- Full product listing with search and category filtering
- Inline actions: edit, toggle active status, toggle featured status, delete
- Add new products with comprehensive form
- Image preview and validation
- Category assignment

### Categories Tab
- Manage all product categories
- Edit category labels, sort order, and disabled status
- Add new categories
- Delete categories (with product impact warning)

## Security Features

- **Row Level Security (RLS)** enabled on all tables
- **Public read access** for active products and categories
- **Authenticated admin access** for all management operations
- **Automatic user record creation** when admin signs up
- **Secure authentication** handled by Supabase Auth

## Responsive Design

The application is fully responsive with breakpoints for:
- Mobile devices (< 640px)
- Tablets (640px - 1024px)
- Desktop (> 1024px)

## Performance Optimizations

- **Memoized filtering** for better search performance
- **Optimized images** with proper sizing and lazy loading
- **Efficient database queries** with proper indexing
- **Component code splitting** for faster initial load

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary software for aquatic play equipment catalog management.