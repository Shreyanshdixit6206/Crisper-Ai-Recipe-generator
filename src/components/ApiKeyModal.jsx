import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Check, AlertCircle, Loader2, Shield, Clock, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    getGeminiApiKey,
    saveGeminiApiKey,
    clearGeminiApiKey,
    hasValidApiKey,
    getKeyExpiryMinutes
} from '../utils/localStorage';
import { validateApiKey } from '../services/geminiApi';

function ApiKeyModal({ onClose }) {
    const [apiKey, setApiKey] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [validationStatus, setValidationStatus] = useState(null);
    const [error, setError] = useState('');
    const [hasKey, setHasKey] = useState(false);
    const [expiryMinutes, setExpiryMinutes] = useState(0);

    // Load existing key status on mount
    useEffect(() => {
        const checkExistingKey = async () => {
            const existingKey = await getGeminiApiKey();
            if (existingKey) {
                setApiKey('••••••••••••••••••••••'); // Mask existing key
                setHasKey(true);
                setExpiryMinutes(getKeyExpiryMinutes());
            }
        };
        checkExistingKey();
    }, []);

    // Update expiry timer
    useEffect(() => {
        if (hasKey) {
            const interval = setInterval(() => {
                const mins = getKeyExpiryMinutes();
                setExpiryMinutes(mins);
                if (mins === 0) {
                    setHasKey(false);
                    setApiKey('');
                }
            }, 60000); // Update every minute
            return () => clearInterval(interval);
        }
    }, [hasKey]);

    const handleSave = async () => {
        if (!apiKey.trim() || apiKey.startsWith('•')) {
            setError('Please enter a new API key');
            return;
        }

        setIsValidating(true);
        setError('');
        setValidationStatus(null);

        const isValid = await validateApiKey(apiKey.trim());

        if (isValid) {
            const saved = await saveGeminiApiKey(apiKey.trim());
            if (saved) {
                setValidationStatus('valid');
                setHasKey(true);
                setExpiryMinutes(30);
                setTimeout(() => onClose(), 1200);
            } else {
                setError('Failed to securely save key. Please try again.');
                setValidationStatus('invalid');
            }
        } else {
            setValidationStatus('invalid');
            setError('Invalid API key. Please check and try again.');
        }

        setIsValidating(false);
    };

    const handleClear = () => {
        clearGeminiApiKey();
        setApiKey('');
        setHasKey(false);
        setValidationStatus(null);
        setError('');
        setExpiryMinutes(0);
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        // If user starts typing when masked key is shown, clear it
        if (apiKey.startsWith('•') && value.length > apiKey.length) {
            setApiKey(value.slice(-1)); // Start fresh with new char
        } else {
            setApiKey(value);
        }
        setError('');
        setValidationStatus(null);
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader className="text-center">
                    <motion.div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        style={{
                            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                            boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)',
                        }}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                    >
                        <Shield className="w-7 h-7 text-amber-600" />
                    </motion.div>
                    <DialogTitle className="text-xl">Secure API Key</DialogTitle>
                    <DialogDescription>
                        Your key is encrypted and stored only for this session
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    {/* Security badges */}
                    <div className="flex flex-wrap gap-2 justify-center">
                        <motion.div
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-700"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Shield className="w-3 h-3" />
                            AES-256 Encrypted
                        </motion.div>
                        <motion.div
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Clock className="w-3 h-3" />
                            Auto-clears in 30 min
                        </motion.div>
                    </div>

                    {/* Expiry indicator if key exists */}
                    <AnimatePresence>
                        {hasKey && expiryMinutes > 0 && (
                            <motion.div
                                className="p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-600" />
                                        <span className="text-sm font-medium text-green-800">Key active</span>
                                    </div>
                                    <span className="text-xs text-green-600 font-medium">
                                        {expiryMinutes} min remaining
                                    </span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="relative">
                        <Input
                            type="password"
                            placeholder={hasKey ? "Enter new key to replace" : "Enter your Gemini API key"}
                            value={apiKey}
                            onChange={handleInputChange}
                            className={`pr-10 h-12 text-base ${validationStatus === 'valid' ? 'border-green-500 focus-visible:ring-green-500' : ''
                                } ${validationStatus === 'invalid' ? 'border-destructive focus-visible:ring-destructive' : ''
                                }`}
                        />
                        {validationStatus === 'valid' && (
                            <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                        )}
                        {validationStatus === 'invalid' && (
                            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-destructive" />
                        )}
                    </div>

                    {error && (
                        <motion.p
                            className="text-sm text-destructive"
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            {error}
                        </motion.p>
                    )}

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={handleClear}
                            disabled={!hasKey && !apiKey}
                            className="flex-1 gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isValidating || !apiKey.trim() || apiKey.startsWith('•')}
                            className="flex-1 gap-2"
                        >
                            {isValidating ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Validating...
                                </>
                            ) : validationStatus === 'valid' ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    Secured!
                                </>
                            ) : (
                                <>
                                    <Key className="w-4 h-4" />
                                    Save Securely
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                <div className="mt-6 p-4 bg-muted rounded-xl">
                    <h4 className="text-sm font-semibold text-foreground mb-2">🔐 Security Features:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• <strong>Encrypted:</strong> AES-256-GCM encryption</li>
                        <li>• <strong>Session-only:</strong> Clears when browser closes</li>
                        <li>• <strong>Auto-expires:</strong> Deletes after 30 minutes of inactivity</li>
                        <li>• <strong>Local only:</strong> Never sent to any server</li>
                    </ul>
                </div>

                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <h4 className="text-sm font-semibold text-amber-800 mb-2">📋 Get your free API key:</h4>
                    <ol className="text-sm text-amber-700 space-y-1 list-decimal list-inside">
                        <li>Go to <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline font-medium">Google AI Studio</a></li>
                        <li>Sign in with Google</li>
                        <li>Click "Create API Key"</li>
                        <li>Paste the key above</li>
                    </ol>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default ApiKeyModal;
