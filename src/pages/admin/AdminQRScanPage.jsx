import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useAuth } from '../../context/AuthContext';
import { Loader, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminQRScanPage() {
    const { apiClient } = useAuth();
    const [scanResult, setScanResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [scannerActive, setScannerActive] = useState(true);

    useEffect(() => {
        // Initialize scanner only if active and not loading result
        let scanner;
        if (scannerActive && !loading) {
            scanner = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
                /* verbose= */ false
            );

            scanner.render(onScanSuccess, onScanFailure);
        }

        return () => {
            if (scanner) {
                scanner.clear().catch(error => console.error("Failed to clear scanner", error));
            }
        };
    }, [scannerActive, loading]);

    const onScanSuccess = (decodedText, decodedResult) => {
        handleScan(decodedText);
    };

    const onScanFailure = (error) => {
        // console.warn(`Code scan error = ${error}`);
    };

    const handleScan = async (qrCode) => {
        if (loading) return;
        setLoading(true);
        setScannerActive(false); // Stop scanning while processing

        try {
            const res = await apiClient.post('/exhibitions/admin/qr-scan/', { qr_code: qrCode });
            setScanResult({ success: true, ...res.data });
            toast.success("Check-in Successful!");
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.error || "Scan Failed";
            setError(msg);
            setScanResult({ success: false, message: msg });
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const resetScanner = () => {
        setScanResult(null);
        setError(null);
        setScannerActive(true);
    };

    return (
        <div className="max-w-md mx-auto p-4 space-y-6">
            <h1 className="text-2xl font-bold text-center text-slate-800">QR Check-In Scanner</h1>

            {!scanResult && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-4">
                    <div id="reader" className="w-full"></div>
                    <p className="text-center text-sm text-slate-500 mt-2">Point camera at Visitor QR Code</p>
                </div>
            )}

            {loading && (
                <div className="flex justify-center py-8">
                    <Loader className="animate-spin text-blue-600 h-12 w-12" />
                </div>
            )}

            {scanResult && (
                <div className={`p-6 rounded-xl text-center shadow-lg ${scanResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    {scanResult.success ? (
                        <>
                            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                            <h2 className="text-xl font-bold text-green-800">Access Granted</h2>
                            <p className="text-green-700 mt-2">{scanResult.visitor}</p>
                            <p className="text-sm text-green-600 font-medium">{scanResult.exhibition}</p>
                        </>
                    ) : (
                        <>
                            {scanResult.message === 'Already checked in' ? (
                                <AlertTriangle className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
                            ) : (
                                <XCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
                            )}
                            <h2 className={`text-xl font-bold ${scanResult.message === 'Already checked in' ? 'text-yellow-800' : 'text-red-800'}`}>
                                {scanResult.message === 'Already checked in' ? 'Already Checked In' : 'Access Denied'}
                            </h2>
                            <p className="text-slate-600 mt-2">{scanResult.message}</p>
                        </>
                    )}

                    <button
                        onClick={resetScanner}
                        className="mt-6 w-full py-3 px-4 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-all"
                    >
                        Scan Next
                    </button>
                </div>
            )}
        </div>
    );
}
