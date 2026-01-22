# 🌲 Mountain Cottage Reservation App using MEAN
**A comprehensive full-stack rental platform for mountain cottages in Serbia.**

Developed as a project for the **Programming Internet Applications (PIA)** course at the *School of Electrical Engineering (ETF), University of Belgrade (2024/25)*.

---

## 📱 App Preview
<video src="https://github.com/user-attachments/assets/2472b1e2-f915-4e2e-8cd3-88ddee03331c" controls title="Mountain Cottage Reservation App Demo" style="max-width: 100%;">
</video>

---


## 💻 Tech Stack
The system is built using the **MEAN Stack**, ensuring a unified JavaScript environment from database to UI:

| Layer | Technology |
| :--- | :--- |
| **Frontend** | **Angular** (Single Page Application) |
| **Backend** | **Node.js** & **Express.js** |
| **Database** | **MongoDB** (NoSQL) |
| **Tools** | MongoDB Compass (Data Management) |

## 👥 User Roles & Features
The system implements complex logic tailored to three distinct user types:

### 🎒 Tourist
* **Search & Browse:** Advanced filtering for mountain cottages.
* **Booking:** Intuitive **multi-step reservation** system.
* **Profiles:** Manage personal data and track reservation history.

### 🏡 Cottage Owner
* **Asset Management:** Tools to list, edit, and manage cottage details.
* **Reservation Control:** Overview of bookings and guest management.
* **Analytics:** Visual statistics for cottage performance.

### 🔑 Administrator
* **User Vetting:** Registration approval workflow for new accounts.
* **System Oversight:** Full management of users and platform content.

## 🚀 Setup & Database Initialization
Detailed setup instructions are available in the **`startup.txt`** file.

### Database Setup
To populate the system with initial data:
1. Open **MongoDB Compass**.
2. Import the JSON/CSV files found in the `database_for_mongoDBcompas/` folder.
3. Ensure the connection string in the Node.js backend matches your local database instance.

## 📂 Documentation
* **Project Requirements:** A full list of implemented features is documented in the `project_description` file.
* **Role Logic:** Code for authentication and role-based guards can be found in the Angular and Express middleware.
