import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Loader, Plus, List, Home, BarChart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ExhibitorHome() {
    const { apiClient, user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState({ applications: 0, properties: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const profileRes = await apiClient.get('/exhibitions/exhibitor/profile/');
                setProfile(profileRes.data);

                // Get Application count
                const appsRes = await apiClient.get('/exhibitions/exhibitor/my-applications/');
                // Get Property count
                const propsRes = await apiClient.get('/exhibitions/exhibitor/my-properties/');

                setStats({
                    applications: appsRes.data.length,
                    properties: propsRes.data.length
                });
            } catch (error) {
                console.error("Dashboard fetch failed", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [apiClient]);

    if (loading) return <div className="flex justify-center p-12"><Loader className="animate-spin text-blue-600" /></div>;

    return (
        <div className="space-y-8">
            <div className="bg-white rounded-xl shadow p-6 border border-slate-200">
                <h1 className="text-2xl font-bold text-slate-900">Welcome, {profile?.user.first_name || user?.username}</h1>
                <p className="text-slate-600">Council: {profile?.council_area}</p>
            </div>

            {/* Quick Stats/Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link to="/exhibitor/applications/new" className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow flex flex-col justify-between h-40">
                    <div className="flex justify-between items-start">
                        <span className="bg-white/20 p-2 rounded-lg"><Plus size={24} /></span>
                        <span className="text-sm font-medium opacity-80">Action</span>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">Apply for Exhibition</h3>
                        <p className="text-sm opacity-90 mt-1">Join upcoming events</p>
                    </div>
                </Link>

                <Link to="/exhibitor/applications" className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:border-blue-400 transition-colors flex flex-col justify-between h-40">
                    <div className="flex justify-between items-start">
                        <span className="bg-orange-100 text-orange-600 p-2 rounded-lg"><List size={24} /></span>
                        <span className="text-2xl font-bold text-slate-900">{stats.applications}</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">My Applications</h3>
                        <p className="text-sm text-slate-500 mt-1">Check status</p>
                    </div>
                </Link>

                <Link to="/exhibitor/properties" className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:border-blue-400 transition-colors flex flex-col justify-between h-40">
                    <div className="flex justify-between items-start">
                        <span className="bg-green-100 text-green-600 p-2 rounded-lg"><Home size={24} /></span>
                        <span className="text-2xl font-bold text-slate-900">{stats.properties}</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">My Properties</h3>
                        <p className="text-sm text-slate-500 mt-1">Manage listings</p>
                    </div>
                </Link>
            </div>

            {/* Guide / Info */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-2">Getting Started</h3>
                <ol className="list-decimal list-inside space-y-2 text-slate-600">
                    <li>Apply for an exhibition using the dashboard card.</li>
                    <li>Wait for Admin approval (Check "My Applications").</li>
                    <li>Once approved, you can list properties for that exhibition in "My Properties".</li>
                </ol>
            </div>
        </div>
    );
}
