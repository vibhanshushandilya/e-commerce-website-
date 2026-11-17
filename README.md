# 🛒 ShopZone — Full-Stack E-Commerce (Django + React)

An Amazon-like e-commerce web app built with **Django REST Framework** (backend) and **React + Vite** (frontend).

## 📁 Project Structure

```
shopzone/
├── backend/          # Django REST API
│   └── myproject/
│       ├── myapp/    # Main app (models, views, serializers)
│       └── myproject/# Django settings & URLs
├── frontend/         # React + Vite SPA
│   └── src/
│       ├── api/      # Axios instance
│       ├── components/
│       ├── context/  # Auth & Cart context
│       └── pages/
└── README.md
```

---

## 🚀 Features

- 🔐 JWT Authentication (register / login / logout)
- 🛍️ Product listing with filters, search & sorting
- 📦 Product detail with images, specs & reviews
- 🛒 Session-based cart (add / remove / update)
- 💳 Checkout with address & payment method
- 📋 Order management with status tracking
- ♥ Wishlist
- 🗂️ 231+ categories, 89 brands, full admin panel
- 📱 Responsive Amazon-inspired UI

---

## ⚙️ Tech Stack

| Layer    | Technology |
|----------|-----------|
| Backend  | Python 3.14, Django 6.1, Django REST Framework |
| Auth     | SimpleJWT |
| Database | PostgreSQL |
| Frontend | React 19, Vite, React Router v7, Axios |
| Styling  | Inline styles (Amazon-inspired) |

---

## 🔧 Backend Setup

### Prerequisites
- Python 3.10+
- PostgreSQL

### Steps

```bash
# 1. Navigate to backend
cd backend/myproject

# 2. Create virtual environment
python -m venv ../../.venv
../../.venv/Scripts/activate   # Windows
# source ../../.venv/bin/activate  # Mac/Linux

# 3. Install dependencies
pip install -r ../../requirements.txt

# 4. Configure environment
cp .env.example .env
# Edit .env with your DB credentials

# 5. Apply migrations
python manage.py migrate

# 6. Seed sample data (categories, brands, products)
python manage.py seed_data

# 7. Create superuser
python manage.py createsuperuser

# 8. Run server
python manage.py runserver
```

Backend runs at: **http://127.0.0.1:8000**
Admin panel: **http://127.0.0.1:8000/admin/**

---

## 🎨 Frontend Setup

### Prerequisites
- Node.js 18+

### Steps

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Configure environment (optional)
cp .env.example .env
# Edit VITE_API_URL if backend is on a different host

# 4. Start dev server
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products/` | List products (filter, search, sort) |
| GET | `/api/products/{id}/` | Product detail |
| GET | `/api/products/featured/` | Featured products |
| GET | `/api/products/bestsellers/` | Best sellers |
| GET | `/api/products/deals/` | Deals (20%+ discount) |
| GET | `/api/categories/` | Category tree |
| GET | `/api/brands/` | All brands |
| POST | `/api/auth/register/` | Register user |
| POST | `/api/auth/login/` | Login → JWT tokens |
| POST | `/api/auth/logout/` | Logout |
| GET/POST | `/api/cart/` | View / update cart |
| GET/POST | `/api/orders/` | List / place order |
| GET/POST/DELETE | `/api/wishlist/` | Wishlist |
| GET/PUT | `/api/profile/` | User profile |

---

## 🗄️ Environment Variables

### Backend (`backend/myproject/.env`)
```env
DB_NAME=ecommerce_db
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://127.0.0.1:8000/api/
```

---

## 📸 Pages

| Page | Route |
|------|-------|
| Home | `/` |
| Products | `/products` |
| Product Detail | `/products/:id` |
| Cart | `/cart` |
| Checkout | `/checkout` |
| Login | `/login` |
| Register | `/register` |
| My Orders | `/orders` |
| Wishlist | `/wishlist` |

---

## 📄 License

MIT
