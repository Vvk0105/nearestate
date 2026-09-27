import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, AlertTriangle, Camera, X, RotateCcw, QrCode, ArrowLeft, Zap } from 'lucide-react';
import FullPageLoader from '../../components/FullPageLoader';

// ── Auth Guard (lightweight check without AdminLayout) ─────────────────────────
function useAdminGuard() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        if (!loading && (!user || user.active_role !== 'ADMIN')) {
            navigate('/admin/login');
        }
    }, [user, loading, navigate]);
    return { user, loading };
}

// ── Scan Result States ─────────────────────────────────────────────────────────
const STATES = { IDLE: 'idle', SCANNING: 'scanning', SUCCESS: 'success', WARNING: 'warning', ERROR: 'error' };

export default function AdminQRScanPage() {
    const { apiClient } = useAuth();
    const navigate = useNavigate();
    const { user, loading } = useAdminGuard();

    const [scanState, setScanState] = useState(STATES.IDLE);
    const [result, setResult] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [autoResetTimer, setAutoResetTimer] = useState(null);

    const scannerRef = useRef(null);
    const html5QrRef  = useRef(null);
    const processedRef = useRef(false); // prevent double-firing

    // ── Start camera scan ─────────────────────────────────────────────────────
    const startScanner = async () => {
        setScanState(STATES.SCANNING);
        processedRef.current = false;

        // Wait for the DOM element to exist
        await new Promise(r => setTimeout(r, 80));

        const qrSize = Math.min(window.innerWidth * 0.65, 280);
        try {
            const html5Qr = new Html5Qrcode('qr-reader');
            html5QrRef.current = html5Qr;

            await html5Qr.start(
                { facingMode: 'environment' },
                { fps: 12, qrbox: { width: qrSize, height: qrSize } },
                (decodedText) => {
                    if (!processedRef.current) {
                        processedRef.current = true;
                        handleScan(decodedText);
                    }
                },
                () => {} // ignore scan failures
            );
        } catch (err) {
            console.error('Camera error:', err);
            toast.error('Could not access camera. Please allow camera permissions.');
            setScanState(STATES.IDLE);
        }
    };

    // ── Stop camera ───────────────────────────────────────────────────────────
    const stopScanner = async () => {
        if (html5QrRef.current) {
            try {
                await html5QrRef.current.stop();
                html5QrRef.current = null;
            } catch (e) { /* ignore */ }
        }
    };

    // ── Cleanup on unmount ────────────────────────────────────────────────────
    useEffect(() => {
        return () => {
            stopScanner();
            if (autoResetTimer) clearTimeout(autoResetTimer);
        };
    }, []);

    // ── Handle a decoded QR code ──────────────────────────────────────────────
    const handleScan = async (qrCode) => {
        await stopScanner();
        setProcessing(true);

        try {
            const res = await apiClient.post('/exhibitions/admin/qr/scan/', { qr_code: qrCode });
            setResult(res.data);
            setScanState(STATES.SUCCESS);
            toast.success('✅ Check-in successful!');

            // Auto-reset after 4s for fast throughput at the gate
            const t = setTimeout(() => resetScanner(), 4000);
            setAutoResetTimer(t);
        } catch (err) {
            const msg = err.response?.data?.error || 'Scan failed';
            setResult({ message: msg });
            if (msg === 'Already checked in') {
                setScanState(STATES.WARNING);
                toast('Already checked in', { icon: '⚠️' });
            } else {
                setScanState(STATES.ERROR);
                toast.error(msg);
            }
        } finally {
            setProcessing(false);
        }
    };

    // ── Reset to idle / ready to scan again ───────────────────────────────────
    const resetScanner = () => {
        if (autoResetTimer) clearTimeout(autoResetTimer);
        setAutoResetTimer(null);
        setResult(null);
        setScanState(STATES.IDLE);
        processedRef.current = false;
    };

    if (loading) return <FullPageLoader message="Loading..." />;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">

            {/* ── Header ── */}
            <header className="flex items-center justify-between px-4 py-4 border-b border-white/10">
                <button
                    onClick={() => { stopScanner(); navigate('/admin/dashboard'); }}
                    className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-medium"
                >
                    <ArrowLeft size={18} /> Dashboard
                </button>
                <div className="flex items-center gap-2 text-white">
                    <QrCode size={20} className="text-indigo-400" />
                    <span className="font-bold text-base tracking-tight">QR Check-In</span>
                </div>
                <div className="text-white/40 text-xs text-right hidden sm:block">
                    {user?.email}
                </div>
                <div className="w-20 sm:hidden" /> {/* spacer on mobile */}
            </header>

            {/* ── Main content ── */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 gap-6">

                {/* ══════ IDLE STATE ══════ */}
                {scanState === STATES.IDLE && (
                    <div className="flex flex-col items-center gap-8 w-full max-w-sm">
                        {/* Icon hero */}
                        <div className="relative">
                            <div className="w-32 h-32 rounded-3xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
                                <QrCode size={60} className="text-indigo-400" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-400 animate-pulse" />
                        </div>
                        <div className="text-center space-y-2">
                            <h1 className="text-2xl font-bold text-white">Gate Check-In</h1>
                            <p className="text-slate-400 text-sm">
                                Scan a visitor's QR code to check them in to the exhibition.
                            </p>
                        </div>
                        <button
                            onClick={startScanner}
                            className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold rounded-2xl text-lg transition-all shadow-lg shadow-indigo-500/30 active:scale-95"
                        >
                            <Camera size={22} /> Open Camera & Scan
                        </button>
                    </div>
                )}

                {/* ══════ SCANNING STATE ══════ */}
                {scanState === STATES.SCANNING && (
                    <div className="flex flex-col items-center gap-5 w-full max-w-sm">
                        <div className="text-center space-y-1">
                            <p className="text-white font-semibold flex items-center gap-2 justify-center">
                                <Zap size={16} className="text-yellow-400 animate-pulse" />
                                Scanning...
                            </p>
                            <p className="text-slate-400 text-xs">Point camera at visitor's QR code</p>
                        </div>

                        {/* Camera viewport */}
                        <div className="relative w-full max-w-xs aspect-square rounded-2xl overflow-hidden border-2 border-indigo-500/60 shadow-2xl shadow-indigo-500/20">
                            <div id="qr-reader" className="w-full h-full" />
                            {/* Corner scan indicators */}
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-indigo-400 rounded-tl-lg" />
                                <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-indigo-400 rounded-tr-lg" />
                                <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-indigo-400 rounded-bl-lg" />
                                <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-indigo-400 rounded-br-lg" />
                                {/* Scan line animation */}
                                <div className="absolute left-4 right-4 h-0.5 bg-indigo-400/70 rounded-full animate-[scanLine_2s_ease-in-out_infinite]" style={{ top: '50%' }} />
                            </div>
                            {processing && (
                                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                                    <div className="w-10 h-10 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => { stopScanner(); setScanState(STATES.IDLE); }}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-all border border-white/10"
                        >
                            <X size={16} /> Stop Camera
                        </button>
                    </div>
                )}

                {/* ══════ SUCCESS STATE ══════ */}
                {scanState === STATES.SUCCESS && (
                    <div className="flex flex-col items-center gap-6 w-full max-w-sm animate-[fadeIn_0.3s_ease]">
                        <div className="w-28 h-28 rounded-full bg-green-500/20 border-2 border-green-400/50 flex items-center justify-center">
                            <CheckCircle size={56} className="text-green-400" />
                        </div>
                        <div className="text-center space-y-1">
                            <h2 className="text-2xl font-bold text-green-400">Access Granted!</h2>
                            <p className="text-white font-semibold text-lg">{result?.visitor}</p>
                            <p className="text-slate-400 text-sm">{result?.exhibition}</p>
                        </div>
                        <div className="w-full bg-green-500/10 border border-green-500/30 rounded-2xl p-4 text-center">
                            <p className="text-green-300 text-xs font-medium">✅ Check-in recorded</p>
                            <p className="text-slate-500 text-xs mt-1">Auto-resetting in 4s...</p>
                        </div>
                        <div className="flex gap-3 w-full">
                            <button
                                onClick={() => { stopScanner(); navigate('/admin/dashboard'); }}
                                className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-sm transition-all border border-white/10"
                            >
                                Done
                            </button>
                            <button
                                onClick={resetScanner}
                                className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/30"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <RotateCcw size={16} /> Scan Next
                                </span>
                            </button>
                        </div>
                    </div>
                )}

                {/* ══════ ALREADY CHECKED IN WARNING ══════ */}
                {scanState === STATES.WARNING && (
                    <div className="flex flex-col items-center gap-6 w-full max-w-sm animate-[fadeIn_0.3s_ease]">
                        <div className="w-28 h-28 rounded-full bg-yellow-500/20 border-2 border-yellow-400/50 flex items-center justify-center">
                            <AlertTriangle size={56} className="text-yellow-400" />
                        </div>
                        <div className="text-center space-y-1">
                            <h2 className="text-2xl font-bold text-yellow-400">Already Checked In</h2>
                            <p className="text-slate-300 text-sm">{result?.message}</p>
                        </div>
                        <div className="flex gap-3 w-full">
                            <button
                                onClick={() => { stopScanner(); navigate('/admin/dashboard'); }}
                                className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-sm transition-all border border-white/10"
                            >
                                Done
                            </button>
                            <button
                                onClick={resetScanner}
                                className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <RotateCcw size={16} /> Scan Next
                                </span>
                            </button>
                        </div>
                    </div>
                )}

                {/* ══════ ERROR STATE ══════ */}
                {scanState === STATES.ERROR && (
                    <div className="flex flex-col items-center gap-6 w-full max-w-sm animate-[fadeIn_0.3s_ease]">
                        <div className="w-28 h-28 rounded-full bg-red-500/20 border-2 border-red-400/50 flex items-center justify-center">
                            <XCircle size={56} className="text-red-400" />
                        </div>
                        <div className="text-center space-y-1">
                            <h2 className="text-2xl font-bold text-red-400">Access Denied</h2>
                            <p className="text-slate-300 text-sm">{result?.message}</p>
                        </div>
                        <button
                            onClick={resetScanner}
                            className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/30"
                        >
                            <span className="flex items-center justify-center gap-2">
                                <RotateCcw size={16} /> Try Again
                            </span>
                        </button>
                    </div>
                )}

            </div>

            {/* ── Scan line animation keyframe ── */}
            <style>{`
                @keyframes scanLine {
                    0%, 100% { transform: translateY(-60px); opacity: 0.3; }
                    50% { transform: translateY(60px); opacity: 1; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(12px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                /* Hide all default html5-qrcode UI elements */
                #qr-reader__scan_region img,
                #qr-reader__scan_region > br,
                #qr-reader__dashboard,
                #qr-reader__status_span { display: none !important; }
                #qr-reader video { width: 100% !important; height: 100% !important; object-fit: cover; }
            `}</style>
        </div>
    );
}
