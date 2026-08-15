# BORAN TRENDS MEN'S WEAR — Full-Stack E-Commerce Platform

A modern, complete, high-performance Men's Fashion E-Commerce application with full-stack Node.js Express REST API backend, MongoDB persistent storage, Admin Dashboard, live product management with image uploads, customer authentication, and direct UPI payment integration (**7013932279**).

---

## 🌟 Key Features

### Customer Storefront
- **Responsive Header & Mobile Menu**: Logo, search bar, wishlist counter, shopping cart counter, customer login, and **mobile three-dot menu containing Admin Login**.
- **Dynamic Category Filtering**:
  - Shirts
  - T-Shirts
  - baggy Jeans
  - formal shirts
  - Formal pants
  - cargo pants
  - hoodies
  - New Arrivals
- **Product Cards & Detail View**: Discounts %, sizes pills, color options, stock badges, rating stars, Wishlist toggle, Add to Cart, Buy Now.
- **Shopping Cart & UPI Checkout**:
  - Subtotal, free shipping over ₹999 indicator, delivery charges.
  - Direct UPI payment integration with PhonePe, GPay, Paytm, and manual payment prompt to **7013932279**.
  - Instant order ID generation (e.g. `BT-94821`), confirmation receipt, and automatic cart clear.
- **Customer Account & Order Tracking**:
  - Customer registration & login (Name, Mobile, Email, Password).
  - Live order tracking timeline: `Pending` → `Confirmed` → `Packed` → `Shipped` → `Delivered`.

### Admin Dashboard
- **Secure Authentication**: Protected via hashed password & JWT session token against unauthorized URL access.
- **Real-Time Analytics**: Total Products, Total Orders, Pending Orders, Delivered Orders, Total Customers, Total Sales (₹).
- **Add Product Form**: Upload actual image files from computer/mobile, set prices, discount %, stock, multi-select sizes, colours, and description.
- **Manage Products**: Search, edit price/stock, and delete items with immediate sync to customer storefront.
- **Order Management**: View complete order details (Customer Name, Mobile, Address, Item breakdown, UPI reference) and update order status live.

---

## 📁 Project Directory Structure

```
boran-trends/
├── frontend/
│   ├── index.html
│   ├── css/
│   ├── js/
│   ├── images/
│   └── pages/
├── backend/
│   ├── server.js
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   │   ├── Product.js
│   │   ├── Order.js
│   │   └── User.js
│   ├── middleware/
│   │   └── auth.js
│   ├── uploads/
│   └── .env.example
└── README.md
```

---

## 🚀 How to Run Locally in VS Code

### Prerequisites
- Install **Node.js** (v18 or higher)
- Install **MongoDB** locally OR create a free **MongoDB Atlas** cluster.

### 1. Backend Setup
1. Open VS Code terminal and navigate to the project root:
   ```bash
   cd boran-trends/backend
   npm install
   ```
2. Create a `.env` file inside `backend/` based on `.env.example`:
   ```env
   PORT=5000
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=BoranTrends@2026
   JWT_SECRET=boran_trends_jwt_secret_key_2026
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/boran_trends?retryWrites=true&w=majority
   UPI_NUMBER=7013932279
   ```
3. Start the backend server:
   ```bash
   npm start
   ```
   The backend REST API will run at `http://localhost:5000`.

### 2. Frontend Running
To run the full-stack connected app in AI Studio / Vite environment:
```bash
npm run dev
```
Open `http://localhost:3000` in your web browser.

---

## 🌐 How to Deploy Online

### 1. MongoDB Atlas Configuration
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free database cluster.
2. Under **Network Access**, add IP address `0.0.0.0/0` (Allow access from anywhere).
3. Under **Database Access**, create a database user and copy your connection URI string.

### 2. Deploy Backend to Render / Railway
1. Push your repository to GitHub.
2. Sign in to [Render](https://render.com) or [Railway](https://railway.app).
3. Create a new **Web Service** connected to your GitHub repo.
4. Set Root Directory to `backend/` or `.`
5. Build Command: `npm install`
6. Start Command: `node server.js`
7. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB Atlas URI string
   - `ADMIN_USERNAME`: admin
   - `ADMIN_PASSWORD`: Your Secure Password
   - `JWT_SECRET`: Random secure string
   - `UPI_NUMBER`: 7013932279
8. Copy the deployed backend service URL (e.g., `https://boran-trends-api.onrender.com`).

### 3. Deploy Frontend to Netlify
1. Log in to [Netlify](https://www.netlify.com).
2. Click **Import from Git** and select your repository.
3. Set Build Command: `npm run build`
4. Set Publish Directory: `dist/`
5. Under Environment Variables, add:
   - `VITE_API_URL`: `https://boran-trends-api.onrender.com`
6. Click **Deploy Site**.

---

## 🔑 Default Admin Credentials

- **Admin Username**: `admin`
- **Admin Password**: `BoranTrends@2026`
- **UPI Payment Receiver Number**: `7013932279`

---

## 🛡️ License

Apache-2.0 / Proprietary to BORAN TRENDS MEN'S WEAR.
