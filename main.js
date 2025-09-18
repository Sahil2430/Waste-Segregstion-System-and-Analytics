import { initializeFirebase, saveWasteData, setupRealtimeListener, clearFirebaseLog } from './firebase.js';
import { elements, createCharts, initializeConveyorBeltUI, showItemDetails, hideItemDetails, applyFilterAndRefreshAnalytics } from './ui.js';
import { startSimulation, stopSimulation, toggleFault, isFaultActive, setFullEventLog } from './simulation.js';

// --- State Variables ---
let isRunning = false;
let isFirebaseReady = false;
let isOfflineMode = false;
let fullEventLog = [];
let currentFilter = 'realtime';
let charts = {};

// --- Event Listeners & System Control ---
function toggleSystem() {
    if (!isFirebaseReady) return; 
    isRunning = !isRunning;
    if (isRunning) {
        elements.startBtn.textContent = 'STOP';
        elements.startBtn.classList.replace('bg-blue-600', 'bg-red-600');
        elements.systemStatusEl.textContent = 'System is running';
        startSimulation();
    } else {
        elements.startBtn.textContent = 'START';
        elements.startBtn.classList.replace('bg-red-600', 'bg-blue-600');
        elements.systemStatusEl.textContent = isOfflineMode ? 'Offline Mode' : 'System is paused';
        elements.systemStatusIndicatorEl.textContent = '-';
        stopSimulation();
    }
}

elements.startBtn.addEventListener('click', toggleSystem);
elements.faultBtn.addEventListener('click', () => {
    toggleFault();
    elements.faultBtn.classList.toggle('bg-yellow-500', !isFaultActive());
    elements.faultBtn.classList.toggle('bg-red-600', isFaultActive());
    elements.faultBtn.textContent = isFaultActive() ? 'FAULT ACTIVE' : 'SIMULATE FAULT';
});
elements.clearLogBtn.addEventListener('click', async () => {
    if (isOfflineMode) {
        fullEventLog = [];
        setFullEventLog(fullEventLog); // Update simulation module
        applyFilterAndRefreshAnalytics(currentFilter, fullEventLog, charts);
    } else {
        await clearFirebaseLog();
    }
});
elements.modalCloseBtn.addEventListener('click', hideItemDetails);
elements.modalBackdrop.addEventListener('click', hideItemDetails);

elements.analyticsFilterEl.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        currentFilter = e.target.dataset.filter;
        elements.analyticsFilterEl.querySelector('.active').classList.remove('active');
        e.target.classList.add('active');
        applyFilterAndRefreshAnalytics(currentFilter, fullEventLog, charts);
    }
});


// --- Initialization ---
async function main() {
    initializeConveyorBeltUI();
    charts = createCharts();

    const firebaseApp = await initializeFirebase();
    
    if (firebaseApp.success) {
        isFirebaseReady = true;
        isOfflineMode = false;
        elements.systemStatusEl.textContent = "System is offline";
        elements.startBtn.disabled = false;
        setupRealtimeListener((log) => {
            fullEventLog = log;
            setFullEventLog(fullEventLog); // Sync with simulation
            applyFilterAndRefreshAnalytics(currentFilter, fullEventLog, charts);
        });
    } else {
        console.error("Running in offline mode.");
        isFirebaseReady = true;
        isOfflineMode = true;
        elements.systemStatusEl.textContent = "Offline Mode";
        elements.startBtn.disabled = false;
        // In offline mode, simulation.js handles the log internally
        // We just need to get it for analytics
        setInterval(() => {
             applyFilterAndRefreshAnalytics(currentFilter, window.fullEventLog || [], charts);
        }, 1000); 
    }
}

window.onload = main;
