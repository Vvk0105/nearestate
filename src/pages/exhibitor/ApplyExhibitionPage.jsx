import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Loader, Calendar, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ApplyExhibitionPage() {
    const { apiClient } = useAuth();
    const [exhibitions, setExhibitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchExhibitions = async () => {
            try {
                // Need public list of exhibitions to apply
                const res = await apiClient.get('/exhibitions/public/exhibitions/');
                // Filter only upcoming/active?
                // "Active" is good.
                const active = res.data.filter(e => e.is_active && new Date(e.end_date) >= new Date());
                setExhibitions(active);
            } catch (error) {
                console.error("Fetch exhibitions failed", error);
            } finally {
                setLoading(false);
            }
        };
        fetchExhibitions();
    }, [apiClient]);

    const handleApply = async (exhibitionId) => {
        // Need a payment screenshot upload usually? Prompts said "fill a form ... user redirect to exhibitor home page"
        // But for application: "ApplyView" usually requires payment info?
        // Let's check `ExhibitorApplyView` in backend/exhibitions/views.py if possible or try post.
        // Assuming for now simple apply or redirect to a form if payment needed.
        // Prompt for Exhibitor Portal: "Apply for Exhibition (Form + Payment Upload)" in my plan.

        // I'll create a simple modal or prompt for file upload here if needed.
        // Or just navigation to a specific Apply Form page `ApplyFormPage`.
        // Let's do a simple file input trigger here for MVP simplicity or a Modal.

        // Actually, navigation to /exhibitor/apply/:id is better.
        navigate(`/exhibitor/apply/${exhibitionId}`);
    };

    if (loading) return <div className="flex justify-center p-12"><Loader className="animate-spin text-blue-600" /></div>;

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-slate-900">Apply for Exhibition</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {exhibitions.map(exhibit => (
                    <div key={exhibit.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-bold text-slate-900">{exhibit.name}</h3>
                            {/* Maybe check if already applied? Requires fetching my-applications first to compare IDs. */}
                        </div>
                        <div className="space-y-2 mb-6 flex-1 text-slate-600 text-sm">
                            <div className="flex items-center gap-2">
                                <Calendar size={16} /> {new Date(exhibit.start_date).toLocaleDateString()} - {new Date(exhibit.end_date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin size={16} /> {exhibit.city}, {exhibit.venue}
                            </div>
                            <p className="mt-2 line-clamp-2">{exhibit.description}</p>
                        </div>

                        <button
                            onClick={() => handleApply(exhibit.id)}
                            className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                            Apply Now
                        </button>
                    </div>
                ))}
                {exhibitions.length === 0 && (
                    <div className="col-span-full text-center py-12 text-slate-500">
                        No active exhibitions available to apply for at the moment.
                    </div>
                )}
            </div>
        </div>
    );
}
