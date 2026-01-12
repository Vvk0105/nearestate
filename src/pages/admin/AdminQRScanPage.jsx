import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useAuth } from '../../context/AuthContext';
import { Card, Button, Spin, Result } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { message } from 'antd';

export default function AdminQRScanPage() {
    const { apiClient } = useAuth();
    const [scanResult, setScanResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [scannerActive, setScannerActive] = useState(true);

    useEffect(() => {
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
        // Ignore scan errors
    };

    const handleScan = async (qrCode) => {
        if (loading) return;
        setLoading(true);
        setScannerActive(false);

        try {
            const res = await apiClient.post('/exhibitions/admin/qr/scan/', { qr_code: qrCode });
            setScanResult({ success: true, ...res.data });
            message.success("Check-in Successful!");
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.error || "Scan Failed";
            setScanResult({ success: false, message: msg });
            message.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const resetScanner = () => {
        setScanResult(null);
        setScannerActive(true);
    };

    return (
        <div className="max-w-md mx-auto p-4 space-y-6">
            <h1 className="text-2xl font-bold text-center">QR Check-In Scanner</h1>

            {!scanResult && (
                <Card>
                    <div id="reader" className="w-full"></div>
                    <p className="text-center text-sm text-gray-500 mt-2">Point camera at Visitor QR Code</p>
                </Card>
            )}

            {loading && (
                <div className="flex justify-center py-8">
                    <Spin size="large" />
                </div>
            )}

            {scanResult && (
                <Card>
                    {scanResult.success ? (
                        <Result
                            status="success"
                            icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                            title="Access Granted"
                            subTitle={
                                <>
                                    <p>{scanResult.visitor}</p>
                                    <p className="text-sm">{scanResult.exhibition}</p>
                                </>
                            }
                            extra={
                                <Button type="primary" size="large" onClick={resetScanner}>
                                    Scan Next
                                </Button>
                            }
                        />
                    ) : (
                        <Result
                            status={scanResult.message === 'Already checked in' ? 'warning' : 'error'}
                            icon={scanResult.message === 'Already checked in' ?
                                <ExclamationCircleOutlined style={{ color: '#faad14' }} /> :
                                <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                            }
                            title={scanResult.message === 'Already checked in' ? 'Already Checked In' : 'Access Denied'}
                            subTitle={scanResult.message}
                            extra={
                                <Button type="primary" size="large" onClick={resetScanner}>
                                    Scan Next
                                </Button>
                            }
                        />
                    )}
                </Card>
            )}
        </div>
    );
}
