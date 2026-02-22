# Simple POS Application

A modern Point of Sales application with separated backend and frontend architecture.

## Project Structure

```
/
├── backend/          # Go (Fiber + GORM) Backend API
│   ├── app/          # Application modules (auth, product, category, sale, user)
│   ├── config/       # Configuration files
│   ├── entity/       # Database entities
│   ├── helper/       # Helper functions
│   ├── middleware/   # HTTP middlewares
│   ├── route/        # API routes
│   └── main.go       # Entry point
│
└── frontend/         # Next.js Frontend
    └── src/
        ├── app/              # Next.js App Router pages
        │   ├── (admin)/      # Admin pages (protected)
        │   ├── (auth)/       # Auth pages (login)
        │   └── (pos)/        # POS pages (protected)
        ├── components/       # React components
        │   ├── admin/        # Admin components
        │   ├── pos/          # POS components
        │   └── ui/           # UI components (shadcn)
        ├── hooks/            # Custom React hooks
        └── lib/              # Utilities and API client
```

## Tech Stack

### Backend
- **Go** - Programming language
- **Fiber** - Web framework
- **GORM** - ORM
- **PostgreSQL** - Database
- **JWT** - Authentication

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Zustand** - State management
- **Axios** - HTTP client

## Getting Started

### Prerequisites
- Go 1.21+
- Node.js 18+
- PostgreSQL 15+

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Edit `.env` with your database credentials

4. Install dependencies:
```bash
go mod download
```

5. Run database migrations and seed default owner:
```bash
go run cmd/migrate/main.go
```
*Note: This will automatically create an owner account (`admin@admin.com` / `admin123`) if no owner exists.*

6. Run the server:
```bash
go run main.go
```

The API will be available at `http://localhost:3001`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Copy environment file:
```bash
cp .env.example .env.local
```

3. Install dependencies:
```bash
npm install
```

4. Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## API Endpoints

### Auth
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password

### Products
- `GET /api/products` - Get all products
- `GET /api/products/search?q=query` - Search products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (OWNER, OPS)
- `PUT /api/products/:id` - Update product (OWNER, OPS)
- `DELETE /api/products/:id` - Delete product (OWNER)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create category (OWNER, OPS)
- `PUT /api/categories/:id` - Update category (OWNER, OPS)
- `DELETE /api/categories/:id` - Delete category (OWNER)

### Sales
- `POST /api/sales` - Create sale
- `GET /api/sales/:id` - Get sale by ID
- `POST /api/sales/:id/pay-cash` - Pay with cash
- `POST /api/sales/:id/pay-qris` - Pay with QRIS
- `GET /api/sales/daily-report` - Get daily report

### Users
- `GET /api/users` - Get all users (OWNER, OPS)
- `GET /api/users/:id` - Get user by ID (OWNER, OPS)
- `POST /api/users` - Create user (OWNER)
- `PUT /api/users/:id` - Update user (OWNER)
- `DELETE /api/users/:id` - Delete user (OWNER)

## User Roles

- **OWNER** - Full access to all features
- **OPS** - Can manage products, categories, view reports
- **CASHIER** - Can only access POS and create sales

## License

MIT