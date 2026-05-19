# 🕌 Luxury Abaya E-Commerce Platform

**A complete e-commerce platform for luxury abayas with retail & wholesale pricing, bilingual support, and role-based dashboards**

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.0-0055FF?logo=framer&logoColor=white)](https://www.framer.com/motion/)

---

## 📖 About

A full-featured e-commerce platform for luxury abayas with bilingual support (Arabic/English), role-based dashboards, dual pricing (retail/wholesale), and a modern glassmorphism UI. Built with React, TypeScript, Tailwind CSS, and Framer Motion.

---

## ✨ Features

### 🌐 Bilingual Support
- Full Arabic/English interface with RTL/LTR support
- All content, forms, and dashboards fully translated

### 👥 Role-Based System

| Role | Access |
|------|--------|
| **Admin** | Full product management (CRUD), order overview, analytics |
| **Customer** | Order history, wishlist, profile management, settings |
| **Wholesale** | Special pricing, bulk orders, exclusive offers |

### 🛍️ Shopping Features
- Dual pricing system (retail + wholesale)
- Custom sizing (height, width, sleeve length)
- Shopping cart with quantity management
- Order summary with tax & shipping calculation

### 🎨 Modern UI
- Glassmorphism design with backdrop blur
- Smooth Framer Motion animations
- Dark/Light theme toggle
- Fully responsive on all devices

### 💾 Local Storage
- Products, cart, and authentication persist in localStorage
- No backend required for demo purposes

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|--------------|
| **Frontend** | React 18, TypeScript |
| **Styling** | Tailwind CSS, Framer Motion |
| **State Management** | Context API (Auth, Cart, Language, Products) |
| **Icons** | Lucide React |
| **Theming** | next-themes |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Header.tsx          # Navigation + user menu
│   ├── Footer.tsx          # Links + contact info
│   ├── Hero.tsx            # Landing section
│   ├── Features.tsx        # Feature cards
│   └── Products.tsx        # Product grid component
├── pages/
│   ├── About.tsx           # Company story + stats
│   ├── Shop.tsx            # Product listing + filters
│   ├── ProductDetail.tsx   # Single product + custom size
│   ├── Cart.tsx            # Shopping cart
│   ├── Contact.tsx         # Contact form + info
│   ├── Wholesale.tsx       # Pricing tiers + CTA
│   ├── Login.tsx           # Authentication form
│   ├── AdminDashboard.tsx  # Admin panel
│   ├── CustomerDashboard.tsx # User panel
│   └── WholesaleDashboard.tsx # Wholesale panel
├── contexts/
│   ├── LanguageContext.tsx # i18n + RTL support
│   ├── AuthContext.tsx     # Authentication state
│   ├── CartContext.tsx     # Shopping cart state
│   └── ProductsContext.tsx # Product CRUD operations
└── App.tsx                 # Main router
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Yaghenm/luxury-abaya-ecommerce.git

# Navigate to project
cd luxury-abaya-ecommerce

# Install dependencies
npm install

# Start development server
npm run dev
```

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| 👑 **Admin** | admin@luxury.com | admin123 |
| 🛍️ **Customer** | customer@luxury.com | customer123 |
| 📦 **Wholesale** | wholesale@luxury.com | wholesale123 |

---

## 🎯 Dashboard Access Overview

| Role | Dashboard Features |
|------|-------------------|
| **Admin** | Product CRUD, order management, sales analytics |
| **Customer** | Order history, wishlist, profile settings, address management |
| **Wholesale** | Bulk pricing view, exclusive offers, order tracking |

---

## 📸 Screenshots

*(Add your screenshots here)*

| Home Page | Shop Page | Admin Dashboard |
|-----------|-----------|-----------------|
| ![Home Page](screenshoots/)| ![Shop Page]() |![Admin Dashboard]()|

| Customer Dashboard | Cart Page | Product Detail |
|--------------------|-----------|----------------|
| ![Customer Dashboard]()| ![Cart Page]() | ![Product Detail]() |

--- 

## 🔮 Future Improvements

- [ ] Backend API integration (Node.js + Express + MongoDB)
- [ ] Payment gateway integration (Stripe / PayPal)
- [ ] Real-time order tracking
- [ ] Email notifications (welcome, order confirmation, shipping)
- [ ] Product reviews & ratings system
- [ ] Advanced inventory management
- [ ] PDF invoice generation
- [ ] Password reset functionality

---

## 📄 License

MIT © [NAIF]

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

## 📧 Contact

For questions or support, please reach out to:
- Email: your-email@example.com
- GitHub: [@Yaghenm](https://github.com/Yaghenm)

---

<div align="center">
  <sub>Built with ❤️ using React & Tailwind CSS</sub>
</div>
---