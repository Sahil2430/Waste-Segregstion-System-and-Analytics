import { elements, updateBeltUI, flashCheckpoint, addLogEntryToDOM, applyFilterAndRefreshAnalytics } from './ui.js';
import { saveWasteData } from './firebase.js';

// --- Simulation Constants ---
const MATERIALS = {
    'organic': { category: 'dumped', irSignature: 'O-SIG' },
    'plastic': { category: 'recycled', irSignature: 'P-SIG' },
    'paper': { category: 'recycled', irSignature: 'C-SIG' },
    'metal': { category: 'recycled', irSignature: 'M-SIG' },
    'glass': { category: 'recycled', irSignature: 'G-SIG' },
    'cardboard': { category: 'recycled', irSignature: 'C-SIG' },
    'e-waste': { category: 'recycled', irSignature: 'E-SIG' },
    'unknown': { category: 'dumped', irSignature: 'U-SIG' }
};
const materialTypes = ['organic', 'plastic', 'paper', 'metal', 'glass', 'cardboard', 'e-waste', 'End of Line'];
const NUM_CHECKPOINTS = materialTypes.length;

// --- State Variables ---
let _isFaultActive = false;
let mainIntervalId = null;
let newItemTimeoutId = null;
let conveyorBelt = new Array(NUM_CHECKPOINTS).fill(null);

// This is a global proxy to allow offline mode to work
window.fullEventLog = []; 
let isOffline = false;

export function setFullEventLog(log) {
    window.fullEventLog = log;
}
export function setOfflineMode(status) {
    isOffline = status;
}

// --- Simulation Logic ---
function createNewItem() {
    if (conveyorBelt[0] === null) {
        const materialKeys = Object.keys(MATERIALS).filter(k => k !== 'unknown');
        const actualMaterial = materialKeys[Math.floor(Math.random() * materialKeys.length)];
        const signature = MATERIALS[actualMaterial].irSignature + '-' + Math.floor(Math.random() * 900 + 100);
        conveyorBelt[0] = { id: Date.now(), actualMaterial: actualMaterial, irSignature: signature, processed: false };
        elements.systemStatusIndicatorEl.textContent = `New item detected: ${actualMaterial}`;
        elements.irSensorResultEl.textContent = conveyorBelt[0].irSignature;
    }
    scheduleNewItem();
}

function scheduleNewItem() {
    const randomDelay = Math.random() * 3000 + 2000;
    newItemTimeoutId = setTimeout(createNewItem, randomDelay);
}

function runMLClassification(item) {
     let prediction = item.actualMaterial;
     let confidence = Math.random() * 15 + 85; 
     if (_isFaultActive || Math.random() < 0.1) {
        const wrongOptions = Object.keys(MATERIALS).filter(m => m !== item.actualMaterial);
        prediction = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
        confidence = Math.random() * 40 + 40;
     }
     item.predictedMaterial = prediction;
     item.mlConfidence = confidence;
     item.processed = true;
     elements.mlPredictionResultEl.textContent = prediction;
     elements.mlConfidenceEl.textContent = `Confidence: ${confidence.toFixed(2)}%`;
     elements.mlConfidenceEl.className = `mt-2 ${confidence > 80 ? 'text-green-400' : 'text-yellow-400'}`;
}

async function advanceConveyorBelt() {
    const lastItem = conveyorBelt[NUM_CHECKPOINTS - 1];
    if (lastItem) { await finalizeItem(lastItem, 'End of Line'); }

    for (let i = NUM_CHECKPOINTS - 1; i > 0; i--) {
        const item = conveyorBelt[i-1];
        if (item && item.processed) {
             if (item.predictedMaterial === materialTypes[i]) {
                 await finalizeItem(item, 'Sorted');
                 conveyorBelt[i-1] = null;
             } else { conveyorBelt[i] = item; }
        } else { conveyorBelt[i] = item; }
    }
    conveyorBelt[0] = null;

    if (conveyorBelt[1] && !conveyorBelt[1].processed) {
        elements.systemStatusIndicatorEl.textContent = `Classifying item: ${conveyorBelt[1].actualMaterial}`;
        runMLClassification(conveyorBelt[1]);
    }
    updateBeltUI(conveyorBelt);
}

async function finalizeItem(item, reason) {
     const category = MATERIALS[item.predictedMaterial]?.category || 'dumped';
     const isCorrect = item.predictedMaterial === item.actualMaterial;
     const checkpointIndex = materialTypes.indexOf(item.predictedMaterial);
     if (reason === 'Sorted' && checkpointIndex !== -1) {
         flashCheckpoint(checkpointIndex, isCorrect ? 'success' : 'fail');
     } else {
         flashCheckpoint(NUM_CHECKPOINTS - 1, 'fail');
     }
     
     const data = {
        predicted_material: item.predictedMaterial,
        actual_material: item.actualMaterial,
        category: category,
        ir_signature: item.irSignature,
        ml_confidence: parseFloat(item.mlConfidence.toFixed(2))
    };
    
    // In offline mode, saveWasteData will handle the local array
    await saveWasteData(data, isOffline);
}

// --- Control Functions ---
export function startSimulation() {
    mainIntervalId = setInterval(advanceConveyorBelt, 800);
    scheduleNewItem();
}

export function stopSimulation() {
    clearInterval(mainIntervalId);
    clearTimeout(newItemTimeoutId);
}

export function toggleFault() {
    _isFaultActive = !_isFaultActive;
}

export function isFaultActive() {
    return _isFaultActive;
}
