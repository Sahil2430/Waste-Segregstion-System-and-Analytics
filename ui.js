// --- DOM Elements ---
export const elements = {
    startBtn: document.getElementById('start-btn'),
    faultBtn: document.getElementById('fault-btn'),
    systemStatusEl: document.getElementById('system-status'),
    systemStatusIndicatorEl: document.getElementById('system-status-indicator'),
    irSensorResultEl: document.getElementById('ir-sensor-result'),
    mlPredictionResultEl: document.getElementById('ml-prediction-result'),
    mlConfidenceEl: document.getElementById('ml-confidence'),
    conveyorBeltEl: document.getElementById('conveyor-belt'),
    eventLogEl: document.getElementById('event-log'),
    clearLogBtn: document.getElementById('clear-log-btn'),
    totalItemsEl: document.getElementById('total-items'),
    accuracyRateEl: document.getElementById('accuracy-rate'),
    throughputRateEl: document.getElementById('throughput-rate'),
    analyticsFilterEl: document.getElementById('analytics-filter'),
    modalEl: document.getElementById('item-inspector-modal'),
    modalBackdrop: document.getElementById('modal-backdrop'),
    modalCloseBtn: document.getElementById('modal-close-btn'),
};

const materialTypes = ['organic', 'plastic', 'paper', 'metal', 'glass', 'cardboard', 'e-waste', 'End of Line'];

// --- Chart Initialization ---
export function createCharts() {
    const charts = {};
    const chartOptions = {
        plugins: { legend: { labels: { color: '#E0E0E0' } } },
        scales: { x: { ticks: { color: '#9CA3AF' }, grid: { color: '#374151' } }, y: { ticks: { color: '#9CA3AF' }, grid: { color: '#374151' }, beginAtZero: true } }
    };

    charts.categories = new Chart(document.getElementById('waste-categories-chart'), {
        type: 'doughnut', data: { labels: ['Recycled', 'Dumped/Special'], datasets: [{ data: [0, 0], backgroundColor: ['#34D399', '#F87171'], borderWidth: 0 }] },
        options: { plugins: { legend: { position: 'top', labels: { color: '#E0E0E0' } } } }
    });

    charts.recycled = new Chart(document.getElementById('recycled-materials-chart'), {
        type: 'bar', data: { labels: [], datasets: [{ label: 'Count', data: [], backgroundColor: '#60A5FA' }] }, options: chartOptions
    });

    charts.trend = new Chart(document.getElementById('processing-trend-chart'), {
        type: 'line', data: { labels: [], datasets: [{ label: 'Items Processed', data: [], borderColor: '#6366F1', tension: 0.1, fill: false }] },
        options: { ...chartOptions, scales: { ...chartOptions.scales, x: { type: 'time', time: { unit: 'minute' }, ticks: { color: '#9CA3AF' } } } }
    });
    return charts;
}

// --- UI Update Functions ---
export function initializeConveyorBeltUI() {
    elements.conveyorBeltEl.innerHTML = '';
    materialTypes.forEach(material => {
        const name = material.charAt(0).toUpperCase() + material.slice(1);
        const checkpointEl = document.createElement('div');
        checkpointEl.className = 'checkpoint p-2 rounded-lg';
        checkpointEl.id = `checkpoint-${material.replace(' ', '-')}`;
        checkpointEl.innerHTML = `<div class="circle mx-auto mb-2"></div><p class="text-xs sm:text-sm font-medium text-gray-300">${name}</p>`;
        elements.conveyorBeltEl.appendChild(checkpointEl);
    });
}

export function updateBeltUI(conveyorBelt) {
    materialTypes.forEach((material, i) => {
        const checkpointId = `checkpoint-${material.replace(' ', '-')}`;
        const checkpointEl = document.getElementById(checkpointId);
        if (checkpointEl) {
            checkpointEl.classList.remove('active', 'success', 'fail');
            if (conveyorBelt[i]) {
                checkpointEl.classList.add('active');
            }
        }
    });
}

export function flashCheckpoint(index, status) {
    const material = materialTypes[index];
    const checkpointId = `checkpoint-${material.replace(' ', '-')}`;
    const checkpointEl = document.getElementById(checkpointId);
    if (checkpointEl) {
        checkpointEl.classList.remove('active');
        checkpointEl.classList.add(status);
        setTimeout(() => checkpointEl.classList.remove(status), 700);
    }
}

export function renderEventLog(logData) {
    elements.eventLogEl.innerHTML = '';
    if (logData.length === 0) {
        elements.eventLogEl.innerHTML = `<div class="text-gray-500 text-center p-4">No data for this period.</div>`;
        return;
    }
    logData.slice(0, 100).forEach(item => addLogEntryToDOM(item, false));
}

export function addLogEntryToDOM(item, prepend = true) {
     if (elements.eventLogEl.children.length > 100) {
        elements.eventLogEl.lastChild.remove();
    }
    const isCorrect = item.predicted_material === item.actual_material;
    const color = isCorrect ? 'text-green-400' : 'text-red-400';
    const message = `Item [${item.actual_material}] sorted as [${item.predicted_material}]`;
    const timestamp = item.timestamp?.toDate().toLocaleTimeString() || new Date().toLocaleTimeString();
    
    const logEntry = document.createElement('div');
    logEntry.className = 'cursor-pointer hover:bg-gray-700/50 p-1 rounded';
    logEntry.innerHTML = `<span class="text-cyan-500">${timestamp}</span> <span class="${color}">${message}</span>`;
    logEntry.addEventListener('click', () => showItemDetails(item));

    if (prepend) {
         elements.eventLogEl.prepend(logEntry);
    } else {
         elements.eventLogEl.appendChild(logEntry);
    }
}


function updateAnalytics(logData, charts) {
    const total = logData.length;
    const correct = logData.filter(item => item.predicted_material === item.actual_material).length;
    const accuracy = total > 0 ? (correct / total * 100) : 0;
    
    const firstTimestamp = total > 0 ? (logData[logData.length - 1].timestamp?.toDate() || new Date(logData[logData.length - 1].id)) : null;
    const lastTimestamp = total > 0 ? (logData[0].timestamp?.toDate() || new Date(logData[0].id)) : null;

    let throughput = 0;
    if (total > 1 && firstTimestamp && lastTimestamp) {
        const durationMinutes = (lastTimestamp - firstTimestamp) / 1000 / 60;
        throughput = durationMinutes > 0 ? ((total - 1) / durationMinutes) : 0;
    }

    elements.totalItemsEl.textContent = total;
    elements.accuracyRateEl.textContent = `${accuracy.toFixed(1)}%`;
    elements.throughputRateEl.textContent = throughput.toFixed(1);
    
    // Update Charts
    const recycledCount = logData.filter(d => d.category === 'recycled').length;
    const dumpedCount = total - recycledCount;
    charts.categories.data.datasets[0].data = [recycledCount, dumpedCount];
    charts.categories.update();

    const recycledData = logData.filter(d => d.category === 'recycled');
    const recycledCounts = recycledData.reduce((acc, item) => {
        acc[item.predicted_material] = (acc[item.predicted_material] || 0) + 1;
        return acc;
    }, {});
    charts.recycled.data.labels = Object.keys(recycledCounts);
    charts.recycled.data.datasets[0].data = Object.values(recycledCounts);
    charts.recycled.update();
    
    const validLogData = logData.filter(d => d.timestamp && typeof d.timestamp.toDate === 'function');
    if (validLogData.length > 0) {
        charts.trend.data.labels = validLogData.map(d => d.timestamp.toDate()).reverse();
        charts.trend.data.datasets[0].data = validLogData.map((_, i) => i + 1).reverse();
    } else {
        charts.trend.data.labels = [];
        charts.trend.data.datasets[0].data = [];
    }
    charts.trend.update();
}

export function showItemDetails(item) {
    const timestamp = item.timestamp?.toDate() ? item.timestamp.toDate().toLocaleString() : new Date(item.id).toLocaleString();
    document.getElementById('modal-timestamp').textContent = timestamp;
    document.getElementById('modal-ir-sig').textContent = item.ir_signature;
    document.getElementById('modal-actual').textContent = item.actual_material;
    const predictedEl = document.getElementById('modal-predicted');
    const confidenceEl = document.getElementById('modal-confidence');
    predictedEl.textContent = item.predicted_material;
    const isCorrect = item.predicted_material === item.actual_material;
    predictedEl.className = `font-mono text-lg ${isCorrect ? 'text-green-400' : 'text-red-400'}`;
    confidenceEl.textContent = `${item.ml_confidence.toFixed(2)}%`;
    confidenceEl.className = `font-mono text-lg ${item.ml_confidence > 80 ? 'text-green-400' : 'text-yellow-400'}`;
    elements.modalEl.classList.remove('hidden');
    elements.modalEl.classList.add('flex');
}

export function hideItemDetails() {
    elements.modalEl.classList.add('hidden');
    elements.modalEl.classList.remove('flex');
}

export function applyFilterAndRefreshAnalytics(currentFilter, fullEventLog, charts) {
    let filteredLog = fullEventLog;
    const now = new Date();
    if (currentFilter === 'hour') {
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        filteredLog = fullEventLog.filter(item => (item.timestamp?.toDate() || new Date(item.id)) > oneHourAgo);
    } else if (currentFilter === 'today') {
        const todayStart = new Date(now.setHours(0, 0, 0, 0));
        filteredLog = fullEventLog.filter(item => (item.timestamp?.toDate() || new Date(item.id)) > todayStart);
    }
    updateAnalytics(filteredLog, charts);
    renderEventLog(filteredLog);
}
