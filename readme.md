Waste Segregation System and Analytics
<p align="center">
<img src="https-placeholder-for-dashboard-image.png" alt="Dashboard Preview" width="800"/>
</p>

<p align="center">
<em>A real-time dashboard simulating an automated waste segregation system with multi-sensor data (IR/ML) and live analytics.</em>
</p>

<p align="center">
<img src="https://www.google.com/search?q=https://img.shields.io/badge/JavaScript-ES6%252B-yellow%3Fstyle%3Dfor-the-badge%26logo%3Djavascript" alt="JavaScript">
<img src="https://www.google.com/search?q=https://img.shields.io/badge/Firebase-Realtime_DB-orange%3Fstyle%3Dfor-the-badge%26logo%3Dfirebase" alt="Firebase">
<img src="https://www.google.com/search?q=https://img.shields.io/badge/Chart.js-Interactive-ff6384%3Fstyle%3Dfor-the-badge%26logo%3Dchart.js" alt="Chart.js">
<img src="https://www.google.com/search?q=https://img.shields.io/badge/Tailwind_CSS-Utility_First-38B2AC%3Fstyle%3Dfor-the-badge%26logo%3Dtailwind-css" alt="Tailwind CSS">
</p>

🚀 Live Demo
[Link to your live demo hosted on GitHub Pages or another service would go here.]

✨ Features
This project provides a comprehensive simulation and analytics platform for a smart waste segregation facility.

Feature

Description

Real-time Monitoring

Connects to a Firebase Firestore database to display live data, ensuring all analytics are up-to-the-second.

Two-Stage Simulation

Simulates a sophisticated sorting process using an IR Sensor for pre-sorting and an ML model for specific material classification.

Interactive Visualization

Utilizes Chart.js to display KPIs through various charts, including waste categories, recycled types, and processing trends.

Dynamic Filtering

Allows users to filter all analytics data by various time ranges (5 Mins, 1 Hr, 1 Day, etc.) to identify trends.

System Controls

Features live controls to start/pause the conveyor and simulate system faults to demonstrate error logging and system resilience.

Modern UI/UX

A fully responsive interface with Light & Dark Mode that respects and saves user preference.

🛠️ How the System Works
The dashboard simulates a multi-stage waste segregation process from start to finish.

Item Generation: The simulation randomly generates a new waste item.

IR Sensor Check: An initial pre-sort classifies the item as "Organic" or "Inorganic."

ML Camera Classification: A simulated ML model provides a specific classification (e.g., "Plastic") and a confidence score.

Sorting & Diversion: The item is diverted, and the corresponding UI checkpoint flashes green. Unidentified items are sent to the "End of Line."

Real-time Data Logging: The result is immediately saved to the Firebase Firestore database.

Live Dashboard Update: An onSnapshot listener detects the new database entry and instantly updates all charts and metrics on the dashboard.

💻 Tech Stack
This project is built with a modern, serverless architecture.

Category

Technology

Frontend

HTML5, CSS3, JavaScript (ES6 Modules)

Styling

Tailwind CSS (Utility-First Framework)

Data Viz

Chart.js (Interactive Charting Library)

Backend

Firebase Firestore (Real-time NoSQL Database) 
 Firebase Authentication (Secure User Sign-in)

UX

Toastify.js (Non-intrusive Notifications)

⚙️ How to Run Locally
To run this dashboard on your own machine, follow these steps:

Prerequisites
Git installed.

Visual Studio Code with the Live Server extension (recommended) OR Python installed.

1. Clone the Repository
git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
cd your-repo-name


