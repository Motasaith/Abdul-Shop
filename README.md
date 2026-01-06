# MERN E-Commerce Application

A comprehensive full-stack e-commerce application built with MongoDB, Express.js, React, and Node.js. This project emphasizes modern security practices, scalability, and a rich user experience with features like social login, multilingual support, and dynamic currency conversion.

## 🚀 Features

### 🛍️ Customer Experience
- **Advanced Product Browsing**: Search, filter, and sort products with ease.
- **Dynamic Pricing**: Global support with **Multi-Currency** selection (USD, EUR, GBP, etc.) powered by live exchange rates.
- **Multilingual Support**: Fully localized interface with language selection.
- **Social Login**: Seamless sign-in using **Google** and **Facebook**.
- **Wishlist & Cart**: Persistent shopping cart and wishlist functionality.
- **Order Tracking**: Detailed order history and status tracking with tracking codes.
- **Public Support Ticket System**: 
  - Guest users can submit support tickets.
  - Track ticket status via Ticket ID.
  - View full conversation history.

### 👨‍💼 Admin Dashboard
- **Dashboard Overview**: Key metrics and analytics at a glance.
- **Product Management**: valid Create, read, update, and delete products with image upload support.
- **Order Management**: Process orders, update statuses, and view details.
- **Support Ticket Management**: Respond to user inquiries, manage ticket status/priority, and view ticket statistics.
- **System Notifications**: Centralized notification center for new orders, tickets, and system alerts.
- **Stock Management**: Inventory tracking and low-stock alerts.

### 🛠️ Technical & Security
- **Authentication**: JWT-based auth with Passport.js for OAuth strategies.
- **Role-Based Access Control**: Secure Admin and User roles.
- **Secure Communications**: Integration with **Brevo**, **MailerSend**, and **Nodemailer** for reliable email delivery.
- **SMS Notifications**: Integration with **Twilio**.
- **Payment Processing**: Secure payments via **Stripe**.
- **Docker Ready**: Complete Docker support for development and production environments.
- **Security Best Practices**: Helmet headers, Rate limiting, Data sanitization, and Input validation.

## 🛠️ Tech Stack

### Backend
- **Node.js** & **Express.js** - Server framework
- **MongoDB** & **Mongoose** - Database and Object Data Modeling
- **Passport.js** - Authentication (Local, Google, Facebook)
- **JWT** - Stateless authentication
- **Stripe** - Payment processing
- **Cloudinary** - Cloud image management
- **Brevo / MailerSend / Nodemailer** - Transactional emails
- **Twilio** - SMS services
- **Express Validator** - Input validation

### Frontend
- **React** & **TypeScript** - Component-based UI
- **Redux Toolkit** - Global state management
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client
- **i18next** - Internationalization (implied by locales)

## 📁 Project Structure

```
mern-ecommerce/
├── backend/
│   ├── config/         # Passport, Database config
│   ├── controllers/    # Route logic
│   ├── middleware/     # Auth, Admin, Validation
│   ├── models/         # Mongoose Schemas
│   ├── routes/         # API Routes (Auth, Products, Orders, Contact, etc.)
│   ├── services/       # Email, SMS services
│   └── server.js       # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Route pages
│   │   ├── services/   # API calls
│   │   ├── store/      # Redux setup
│   │   └── locales/    # I18n translation files
├── docker-compose.yml  # Dev orchestration
├── docker-compose.prod.yml # Production orchestration
└── Dockerfile          # Container definition
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v16+)
- MongoDB (Local or Atlas)
- Git
- Docker (Optional)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/mern-ecommerce.git
cd mern-ecommerce
```

### 2. Install Dependencies
```bash
# Install root, backend, and frontend dependencies
npm run install-all
```

### 3. Environment Configuration

Create `.env` file in `backend/` and `frontend/`:

**Backend (.env)**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_jwt_secret
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Payment & Media
STRIPE_SECRET_KEY=sk_test_...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Auth Providers
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...

# Email & SMS
EMAIL_SERVICE=gmail
EMAIL_USER=...
EMAIL_PASS=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
```

**Frontend (.env)**
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 4. Run the Application

**Standard Mode:**
```bash
npm run dev
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

**Docker Mode:**
```bash
docker-compose up --build
```

## 🔐 API Documentation Overview

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/google` & `facebook`

### Products
- `GET /api/products` (Public)
- `POST /api/products` (Admin)

### Orders
- `POST /api/orders` (Checkout)
- `GET /api/orders/myorders` (User history)
- `GET /api/orders/:id/track` (Public tracking)

### Support & Notifications
- `POST /api/contact` (Submit Ticket)
- `GET /api/contact/my-tickets` (User history)
- `GET /api/notifications` (Admin)

### Global Settings
- `GET /api/settings/currency`
- `GET /api/settings/languages`

## 🐳 Deployment

### Render / Heroku
The project is configured for seamless deployment on platforms like Render.
1. Connect GitHub repo.
2. Set Environment Variables in the dashboard.
3. Build Command: `npm install && npm run build` (Frontend).
4. Start Command: `node server.js` (Backend).

### Docker Production
Use the production compose file for a streamlined single-container deployment or orchestrated setup.
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📄 License

This project is licensed under the MIT License.
