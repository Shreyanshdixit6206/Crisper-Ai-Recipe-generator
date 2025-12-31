// Secure storage utility for sensitive data like API keys
// Uses encryption + session storage for maximum security

// Simple encryption using Web Crypto API (for client-side obfuscation)
// Note: This is client-side encryption for added security layers,
// but the true security comes from using sessionStorage (clears on close)

const STORAGE_KEYS = {
    FIRST_VISIT: 'crisper_first_visit',
    SAVED_RECIPES: 'crisper_saved_recipes',
    FILTER_PREFERENCES: 'crisper_filters',
    RECENT_INGREDIENTS: 'crisper_recent_ingredients',
    ENCRYPTED_KEY: 'crisper_secure_key',
    KEY_TIMESTAMP: 'crisper_key_ts',
};

// Legacy keys that should be cleared for security
const LEGACY_KEYS = [
    'crisper_gemini_key',
    'crisper_api_key',
    'gemini_api_key',
];

// Key expiry time (30 minutes in milliseconds)
const KEY_EXPIRY_MS = 30 * 60 * 1000;

// Clear any old plaintext API keys from localStorage (security cleanup)
export const clearLegacyKeys = () => {
    LEGACY_KEYS.forEach(key => {
        if (localStorage.getItem(key)) {
            localStorage.removeItem(key);
            console.log(`[Security] Cleared legacy key: ${key}`);
        }
    });
};

// Generate a session-unique encryption key
const getEncryptionKey = async () => {
    let sessionKey = sessionStorage.getItem('crisper_session_id');
    if (!sessionKey) {
        // Generate unique session identifier
        sessionKey = crypto.randomUUID();
        sessionStorage.setItem('crisper_session_id', sessionKey);
    }

    // Derive a crypto key from session ID
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(sessionKey + navigator.userAgent.slice(0, 20)),
        'PBKDF2',
        false,
        ['deriveKey']
    );

    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: encoder.encode('crisper-salt-v1'),
            iterations: 100000,
            hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
};

// Encrypt API key
const encryptKey = async (plainText) => {
    try {
        const key = await getEncryptionKey();
        const encoder = new TextEncoder();
        const iv = crypto.getRandomValues(new Uint8Array(12));

        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            encoder.encode(plainText)
        );

        // Combine IV and encrypted data
        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv, 0);
        combined.set(new Uint8Array(encrypted), iv.length);

        // Convert to base64 for storage
        return btoa(String.fromCharCode(...combined));
    } catch (err) {
        console.error('Encryption failed:', err);
        return null;
    }
};

// Decrypt API key
const decryptKey = async (encryptedData) => {
    try {
        const key = await getEncryptionKey();

        // Decode from base64
        const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

        // Extract IV and encrypted data
        const iv = combined.slice(0, 12);
        const encrypted = combined.slice(12);

        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            key,
            encrypted
        );

        return new TextDecoder().decode(decrypted);
    } catch (err) {
        console.error('Decryption failed:', err);
        return null;
    }
};

// Check if key has expired
const isKeyExpired = () => {
    const timestamp = sessionStorage.getItem(STORAGE_KEYS.KEY_TIMESTAMP);
    if (!timestamp) return true;

    const savedTime = parseInt(timestamp, 10);
    const now = Date.now();

    return (now - savedTime) > KEY_EXPIRY_MS;
};

// ============= EXPORTED API KEY FUNCTIONS =============

// Get API key (decrypts and checks expiry)
export const getGeminiApiKey = async () => {
    try {
        // Check expiry first
        if (isKeyExpired()) {
            clearGeminiApiKey();
            return '';
        }

        const encrypted = sessionStorage.getItem(STORAGE_KEYS.ENCRYPTED_KEY);
        if (!encrypted) return '';

        const decrypted = await decryptKey(encrypted);
        return decrypted || '';
    } catch {
        return '';
    }
};

// Synchronous version for initial checks (returns cached value if available)
let cachedKey = null;
export const getGeminiApiKeySync = () => {
    if (isKeyExpired()) {
        cachedKey = null;
        clearGeminiApiKey();
        return '';
    }
    return cachedKey || '';
};

// Save API key (encrypts and stores in sessionStorage)
export const saveGeminiApiKey = async (key) => {
    try {
        const encrypted = await encryptKey(key);
        if (encrypted) {
            sessionStorage.setItem(STORAGE_KEYS.ENCRYPTED_KEY, encrypted);
            sessionStorage.setItem(STORAGE_KEYS.KEY_TIMESTAMP, Date.now().toString());
            cachedKey = key; // Cache for sync access
            return true;
        }
        return false;
    } catch {
        return false;
    }
};

// Clear API key
export const clearGeminiApiKey = () => {
    sessionStorage.removeItem(STORAGE_KEYS.ENCRYPTED_KEY);
    sessionStorage.removeItem(STORAGE_KEYS.KEY_TIMESTAMP);
    sessionStorage.removeItem('crisper_session_id');
    cachedKey = null;
};

// Check if API key exists and is valid
export const hasValidApiKey = () => {
    if (isKeyExpired()) {
        clearGeminiApiKey();
        return false;
    }
    return !!sessionStorage.getItem(STORAGE_KEYS.ENCRYPTED_KEY);
};

// Get remaining time until key expires (in minutes)
export const getKeyExpiryMinutes = () => {
    const timestamp = sessionStorage.getItem(STORAGE_KEYS.KEY_TIMESTAMP);
    if (!timestamp) return 0;

    const savedTime = parseInt(timestamp, 10);
    const elapsed = Date.now() - savedTime;
    const remaining = KEY_EXPIRY_MS - elapsed;

    return Math.max(0, Math.ceil(remaining / 60000));
};

// Refresh key timestamp (extend session)
export const refreshKeyTimestamp = () => {
    if (sessionStorage.getItem(STORAGE_KEYS.ENCRYPTED_KEY)) {
        sessionStorage.setItem(STORAGE_KEYS.KEY_TIMESTAMP, Date.now().toString());
    }
};

// ============= OTHER STORAGE FUNCTIONS (unchanged) =============

// Check if this is user's first visit
export const isFirstVisit = () => {
    return localStorage.getItem(STORAGE_KEYS.FIRST_VISIT) === null;
};

export const markVisited = () => {
    localStorage.setItem(STORAGE_KEYS.FIRST_VISIT, 'false');
};

// Saved recipes management
export const getSavedRecipes = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.SAVED_RECIPES);
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
};

export const saveRecipe = (recipe) => {
    const saved = getSavedRecipes();
    const exists = saved.some(r => r.id === recipe.id);
    if (!exists) {
        saved.push({ ...recipe, savedAt: new Date().toISOString() });
        localStorage.setItem(STORAGE_KEYS.SAVED_RECIPES, JSON.stringify(saved));
    }
    return saved;
};

export const removeSavedRecipe = (recipeId) => {
    const saved = getSavedRecipes();
    const filtered = saved.filter(r => r.id !== recipeId);
    localStorage.setItem(STORAGE_KEYS.SAVED_RECIPES, JSON.stringify(filtered));
    return filtered;
};

export const isRecipeSaved = (recipeId) => {
    const saved = getSavedRecipes();
    return saved.some(r => r.id === recipeId);
};

// Filter preferences
export const getFilterPreferences = () => {
    try {
        const prefs = localStorage.getItem(STORAGE_KEYS.FILTER_PREFERENCES);
        return prefs ? JSON.parse(prefs) : null;
    } catch {
        return null;
    }
};

export const saveFilterPreferences = (filters) => {
    localStorage.setItem(STORAGE_KEYS.FILTER_PREFERENCES, JSON.stringify(filters));
};

// Recent ingredients
export const getRecentIngredients = () => {
    try {
        const recent = localStorage.getItem(STORAGE_KEYS.RECENT_INGREDIENTS);
        return recent ? JSON.parse(recent) : [];
    } catch {
        return [];
    }
};

export const addRecentIngredients = (ingredients) => {
    const recent = getRecentIngredients();
    const updated = [...new Set([...ingredients, ...recent])].slice(0, 20);
    localStorage.setItem(STORAGE_KEYS.RECENT_INGREDIENTS, JSON.stringify(updated));
    return updated;
};
