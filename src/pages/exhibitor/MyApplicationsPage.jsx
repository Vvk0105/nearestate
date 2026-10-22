import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, CheckCircle, XCircle, Loader } from 'lucide-react';
import { Modal } from 'antd';
import toast from 'react-hot-toast';
import FullPageLoader from '../../components/FullPageLoader';

export default function MyApplicationsPage() {
    const MEDIA_BASE = import.meta.env.VITE_MEDIA_BASE_URL || (import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '') : '');
    const [previewImage, setPreviewImage] = useState(null);
    const [previewVisible, setPreviewVisible] = useState(false);
    const { apiClient } = useAuth();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState(null);

    const formatMediaUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;

        let base = MEDIA_BASE.endsWith('/') ? MEDIA_BASE.slice(0, -1) : MEDIA_BASE;
        let cleanPath = path.startsWith('/') ? path : `/${path}`;

        // Prevent double /media/ if VITE_MEDIA_BASE_URL was explicitly set with /media
        if (base.endsWith('/media') && cleanPath.startsWith('/media')) {
            base = base.slice(0, -6);
        }

        return `${base}${cleanPath}`;
    };

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

    const handleCancel = (app) => {
        Modal.confirm({
            title: 'Cancel this application?',
            content: `Your pending application for ${app.exhibition} will be removed.`,
            okText: 'Yes, cancel it',
            okType: 'danger',
            cancelText: 'Keep it',
            onOk: async () => {
                setCancellingId(app.exhibition_id);
                try {
                    await apiClient.delete(`/exhibitions/exhibitor/my-applications/?exhibition_id=${app.exhibition_id}`);
                    setApplications(prev => prev.filter(a => a.exhibition_id !== app.exhibition_id));
                    toast.success('Application cancelled');
                } catch (error) {
                    console.error('Cancel failed', error);
                    toast.error('Could not cancel the application. Please try again.');
                } finally {
                    setCancellingId(null);
                }
            },
        });
    };

    if (loading) return <FullPageLoader message="Loading your applications..." />;

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-slate-900">My Applications</h1>

            <div className="space-y-4">
                {applications.map(app => (
                    <div key={app.exhibition_id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <Link
                                to={`/exhibitor/events/${app.exhibition_id}`}
                                className="group inline-block"
                            >
                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 group-hover:underline">{app?.exhibition}</h3>
                                <span className="text-sm text-blue-600">View event →</span>
                            </Link>
                            <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                                {/* <Calendar size={14} /> Applied on: {new Date(app.applied_at).toLocaleDateString()} */}
                            </div>
                            <div className='flex flex-row gap-4 justify-start items-center flex-wrap mt-1'>
                                {app.booking_ref && (
                                    <p className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded">
                                        Ref: <strong>{app.booking_ref}</strong>
                                    </p>
                                )}
                                {app.booth_number && (
                                    <p className="text-sm text-slate-600">Booth: <strong>{app?.booth_number}</strong></p>
                                )}
                                {app.badge ? (
                                    <div className="cursor-pointer" onClick={() => { setPreviewImage(formatMediaUrl(app.badge)); setPreviewVisible(true); }}>
                                        <p className="text-sm text-slate-600 mt-1">Badge <span className="text-purple-500">Preview</span></p>
                                    </div>
                                ): (
                                    <span className="text-sm text-slate-400">No Badge</span>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col items-start sm:items-end gap-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 ${app.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                    app.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                                }`}>
                                {app.status === 'APPROVED' && <CheckCircle size={16} />}
                                {app.status === 'REJECTED' && <XCircle size={16} />}
                                {app.status === 'PENDING' && <Clock size={16} />}
                                {app.status}
                            </span>

                            {app.status === 'PENDING' && (
                                <button
                                    type="button"
                                    disabled={cancellingId === app.exhibition_id}
                                    onClick={() => handleCancel(app)}
                                    className="px-3 py-1.5 rounded-lg text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 flex items-center gap-2 transition-colors disabled:opacity-60"
                                >
                                    {cancellingId === app.exhibition_id ? <Loader size={14} className="animate-spin" /> : <XCircle size={14} />}
                                    Cancel application
                                </button>
                            )}
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
                width={800}
                title="Badge Preview"
            >
                {previewImage && previewImage.toLowerCase().endsWith('.pdf') ? (
                    <iframe
                        src={previewImage}
                        title="Badge Preview"
                        style={{ width: '100%', height: '70vh', border: 'none', borderRadius: 8 }}
                    />
                ) : (
                    <img
                        src={previewImage}
                        alt="Preview"
                        style={{ width: '100%', borderRadius: 8 }}
                    />
                )}
            </Modal>
        </div>
    );
}
