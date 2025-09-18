Waste Sorting System Analytics
This project is a web-based dashboard that simulates a real-time waste sorting system using an IR sensor and a camera-based Machine Learning model. It provides live analytics, a visual representation of the sorting process on a conveyor belt, and a detailed event log.

The application is built with vanilla HTML, CSS, and JavaScript, using Tailwind CSS for styling and Chart.js for data visualization. It integrates with Google Firebase (Firestore) for persistent data logging but includes a fallback "Offline Mode" to ensure the demo is always functional.

File Structure
The project is broken down into a modular structure for better organization and maintainability.

Frontend
index.html: The main HTML file. It contains the structure of the page and links to the stylesheets and scripts.

style.css: Contains all the custom CSS and styling for the application.

main.js: The main entry point for the application's JavaScript. It handles the overall application state and initializes all modules.

ui.js: This module is responsible for all DOM manipulations. It creates charts, updates text, renders the event log, and manages the visual state of the UI components.

simulation.js: Contains the core logic for the waste sorting simulation. It manages the conveyor belt state, creates new waste items, and processes them through the sorting checkpoints.

firebase.js: Handles all interactions with the Firebase backend, including initialization, authentication, writing data to Firestore, and setting up real-time listeners.

Backend
firestore.rules: This file defines the security rules for the Cloud Firestore database. It specifies who can read from and write to the database collections.

How It Works
Initialization: On page load, main.js initializes the UI (ui.js) and attempts to connect to Firebase (firebase.js).

Firebase Connection:

If the connection is successful, the app runs in Online Mode. A real-time listener is attached to the Firestore collection to sync data.

If the connection fails (due to invalid keys, no internet, etc.), the app seamlessly falls back to Offline Mode.

Simulation Start: When the user clicks "START", main.js calls simulation.js to begin the process.

Item Processing: The simulation module (simulation.js) periodically creates new waste items and advances them along a virtual conveyor belt. It calls functions in ui.js to update the visuals.

Data Logging:

In Online Mode, each processed item is saved to Firestore via firebase.js. The UI is then updated by the real-time listener.

In Offline Mode, processed items are saved to a local array within the simulation.js module, and the UI is updated directly.

Analytics: The ui.js module reads the event log (either from Firebase or the local array) and recalculates all statistics and charts.

Setup & Deployment
Firebase Configuration:

Open firebase.js.

Replace the placeholder userFirebaseConfig object with your own Firebase project's configuration keys.

Deploy to GitHub Pages:

Upload all the files (index.html, style.css, *.js, firestore.rules) to a new GitHub repository.

In the repository's settings, go to the "Pages" section.

Select the branch you want to deploy from (e.g., main) and click "Save".

GitHub will provide you with a live URL for your project.

Firestore Rules:

In your Firebase project console, go to Firestore Database -> Rules.

Copy the content of firestore.rules and paste it into the editor.

Publish the rules.