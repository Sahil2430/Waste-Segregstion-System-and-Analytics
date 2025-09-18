import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, serverTimestamp, query, deleteDoc, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { setOfflineMode, setFullEventLog } from './simulation.js';
import { addLogEntryToDOM } from './ui.js';

let db, auth, wasteLogCollection, userId, appId, unsubscribe;

// --- User's Firebase Config ---
const userFirebaseConfig = {
  apiKey: "AIzaSyAGYZY_bw7OwrutPQS6wNzSaSPBT2krGkk",
  authDomain: "waste-sorting-system-analytics.firebaseapp.com",
  projectId: "waste-sorting-system-analytics",
  storageBucket: "waste-sorting-system-analytics.firebasestorage.app",
  messagingSenderId: "252843946600",
  appId: "1:252843946600:web:232e46c83cf622025541dd",
  measurementId: "G-KGRCC9CEW0"
};

// --- Initialization ---
export async function initializeFirebase() {
    try {
        let firebaseConfig, isCloudEnv;
        try { isCloudEnv = typeof __firebase_config !== 'undefined' && __firebase_config !== '{}'; } catch (e) { isCloudEnv = false; }

        if (isCloudEnv) {
            firebaseConfig = JSON.parse(__firebase_config);
            appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        } else {
            firebaseConfig = userFirebaseConfig;
            appId = firebaseConfig.projectId;
        }

        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);

        return new Promise((resolve) => {
            onAuthStateChanged(auth, async (user) => {
                if (user) { 
                    userId = user.uid; 
                    resolve({ success: true, db, auth });
                }
            });

            if (isCloudEnv) {
                const token = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
                if (token) { signInWithCustomToken(auth, token).catch(e => resolve({success: false, error: e})); } 
                else { signInAnonymously(auth).catch(e => resolve({success: false, error: e})); }
            } else {
                signInAnonymously(auth).catch(e => resolve({success: false, error: e}));
            }
        });

    } catch (error) {
        return { success: false, error };
    }
}


// --- Data Functions ---
export async function saveWasteData(data, isOffline) {
     if (isOffline) {
        const newItem = {
            ...data,
            id: Date.now(),
            timestamp: { toDate: () => new Date() } 
        };
        window.fullEventLog.unshift(newItem); // Use the global proxy
        addLogEntryToDOM(newItem, true);
        return Promise.resolve();
     } else {
        if (!wasteLogCollection) return Promise.reject("Collection not ready");
        return addDoc(wasteLogCollection, { ...data, timestamp: serverTimestamp() });
     }
}

export function setupRealtimeListener(callback) {
    if (!userId) return; 
    if (unsubscribe) unsubscribe(); 

    const collectionPath = `artifacts/${appId}/public/data/wasteLog`;
    wasteLogCollection = collection(db, collectionPath);
    const q = query(wasteLogCollection, orderBy("timestamp", "desc"));
    
    unsubscribe = onSnapshot(q, (snapshot) => {
        const log = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(log);
    }, (error) => {
        console.error("Firebase listener failed:", error);
        setOfflineMode(true);
    });
}

export async function clearFirebaseLog() {
    if (!wasteLogCollection) return;
    const q = query(wasteLogCollection);
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (doc) => await deleteDoc(doc.ref));
}