import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Modal } from 'antd';
import FullPageLoader from '../../components/FullPageLoader';

export default function MyApplicationsPage() {
    const MEDIA_BASE = import.meta.env.VITE_MEDIA_BASE_URL;
    const [previewImage, setPreviewImage] = useState(null);
    const [previewVisible, setPreviewVisible] = useState(false);
    const { apiClient } = useAuth();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApps = async () => {
            try {
                const res = await apiClient.get('/exhibitions/exhibitor/my-applications/');
                setApplications(res.data);
            } catch (error) {
                console.error("Fetch applications failed", error);
            } finally {
                setLoading(false);
            }
        };
        fetchApps();
    }, [apiClient]);

    if (loading) return <FullPageLoader message="Loading your applications..." />;

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-slate-900">My Applications</h1>

            <div className="space-y-4">
                {applications.map(app => (
                    <div key={app.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">{app?.exhibition}</h3>
                            <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                                {/* <Calendar size={14} /> Applied on: {new Date(app.applied_at).toLocaleDateString()} */}
                            </div>
                            <div className='flex flex-row gap-4 justify-center items-center'>
                                {app.booth_number && (
                                    <p className="text-sm text-slate-600 mt-1">Booth: <strong>{app?.booth_number}</strong></p>
                                )}
                                {app.badge ? (
                                    <div className="cursor-pointer" onClick={() => { setPreviewImage(`${MEDIA_BASE}${app.badge}`); setPreviewVisible(true); }}>
                                        <p className="text-sm text-slate-600 mt-1">Badge <span className="text-purple-500">Preview</span></p>
                                    </div>
                                ): (
                                    <span>No Badge</span>
                                )}
                            </div>
                        </div>

                        <div>
                            <span className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 ${app.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                    app.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                                }`}>
                                {app.status === 'APPROVED' && <CheckCircle size={16} />}
                                {app.status === 'REJECTED' && <XCircle size={16} />}
                                {app.status === 'PENDING' && <Clock size={16} />}
                                {app.status}
                            </span>
                        </div>
                    </div>
                ))}
                {applications.length === 0 && (
                    <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        No applications found. Apply for an exhibition to get started.
                    </div>
                )}
            </div>

            <Modal
                open={previewVisible}
                footer={null}
                onCancel={() => setPreviewVisible(false)}
                width={600}
            >
                <img
                    src={previewImage}
                    alt="Transaction Screenshot"
                    style={{ width: '100%', borderRadius: 8 }}
                />
            </Modal>
        </div>
    );
}
