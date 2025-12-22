# 🚛 OptiTruck Connect — Logistics & Fleet Management System

OptiTruck Connect is a full-stack logistics solution designed to bridge the gap between **Warehouse Managers** and **Truck Dealers**. The platform allows for real-time shipment creation, truck fleet management, and an automated booking request system to streamline supply chain operations.

### 🔗 Live Links

* **Frontend Application:** [https://optitruck-frontend.onrender.com](https://optitruckconnect.onrender.com/)
* **Backend API:** [https://optitruck-backend.onrender.com](https://smart-truck-loading-optimization-project.onrender.com)

---

## 🚀 Getting Started (Quick Run)

If you just want to see the application in action, you can run the frontend locally. By default, it is configured to communicate with our **deployed backend API**.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/optitruck-connect.git
cd smart-truck

```

### 2. Launch the Frontend

```bash
cd frontend
npm install
npm start

```

*The app will open at `http://localhost:3000`. You can start registering as a Warehouse or Dealer immediately!*

---

## 🛠️ Backend Customization (Self-Hosting)

If you want to use your own database or modify the server logic, follow these steps to set up your personal environment.

### 1. Setup the Backend

```bash
cd backend
npm install

```

### 2. Environment Configuration

Create a `.env` file inside the `backend` folder:

```env
PORT=5000
MONGO_URI=mongodb+srv://<your_username>:<your_password>@cluster.mongodb.net/SmartTruckDB

```

### 3. Update Frontend API Links

To point your frontend to your local backend (or your own deployed version), locate your API call files (e.g., `Login.js`, `Signup.js`, `Dashboard.js`) and update the fetch URL:

```javascript
// Change from:
const BASE_URL = "https://optitruck-backend.onrender.com";

// To your local server:
const BASE_URL = "http://localhost:5000";

```

---

## 📦 Project Structure

```text
optitruck-connect/
│
├── frontend/               # ReactJS Application (UI/UX)
│   ├── src/
│   │   ├── components/     # Reusable UI elements
│   │   └── pages/          # Login, Signup, Dashboards
|   |   └── styles /        # css
|   |   └── utils /         # data
│   └── public/
│
├── backend/                # NodeJS + Express (Logic & API)
│   ├── models/             # Mongoose Schemas (User, Truck, Shipment)
│   └── db.js               # Main Server & Database Connection
│
└── README.md               # You're here!

```

---

## 🔄 Automated Workflow & Status Tracking

The system features a complex state machine that synchronizes the status of trucks and shipments as they progress through the delivery lifecycle.

### 🚛 Truck Statuses

* **Available:** Truck is listed by a dealer and waiting for a request.
* **In Use:** Truck has been assigned to a shipment and is currently unavailable for other orders.

### 📦 Shipment Statuses

* **Pending:** Shipment created by a warehouse and visible on the marketplace.
* **Requested:** A booking request has been sent to a specific truck dealer.
* **Assigned:** The dealer has accepted the order.
* **In Picked:** The truck has arrived at the warehouse for pickup.
* **In Transit:** The shipment is currently on the move.
* **Delivered:** The shipment has reached its destination, and the truck returns to "Available" status.

---

## 🌍 Technologies Used

| Category | Tools / Frameworks |
| --- | --- |
| **Frontend** | ReactJS, CSS3 (Inter Font Integration) |
| **Backend** | NodeJS, ExpressJS |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Deployment** | Render (Web Services & Static Sites) |
| **State Management** | React Hooks & Context API |

---

## 🔒 Security Note

Ensure that your `.env` file is added to your `.gitignore`. Never push your MongoDB credentials or secret keys to a public repository.

---

## 👥 Team

Built with ❤️ by **Pramodha Kasam** , **Neharika Vasa**, **Ravi Kiran Sambaladeevi** and **Satwika Gunuputi**.
