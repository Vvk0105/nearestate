import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Loader, Calendar, Users, Store, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
    const { apiClient } = useAuth();
    const [stats, setStats] = useState({
        total_events: 0,
        active_events: 0,
        total_visitors: 0,
        total_exhibitors: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [eventsRes] = await Promise.all([
                    apiClient.get('/exhibitions/public/exhibitions/')
                ]);

                const events = eventsRes.data;
                const active = events.filter(e => e.is_active);

                setStats({
                    total_events: events.length,
                    active_events: active.length,
                    total_visitors: 0,
                    total_exhibitors: 0 
                });
            } catch (error) {
                console.error("Fetch stats failed", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [apiClient]);

    if (loading) return <div className="flex justify-center p-12"><Loader className="animate-spin text-blue-600" /></div>;

    const StatCard = ({ title, value, Icon, color }) => (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
            <div>
                <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">{title}</p>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{value}</h3>
            </div>
            <div className={`p-4 rounded-full ${color}`}>
                <Icon size={24} className="text-white" />
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Events" value={stats.total_events} Icon={Calendar} color="bg-blue-600" />
                <StatCard title="Active Events" value={stats.active_events} Icon={TrendingUp} color="bg-green-500" />
                <StatCard title="Exhibitors" value={stats.total_exhibitors} Icon={Store} color="bg-purple-500" />
                <StatCard title="Visitors" value={stats.total_visitors} Icon={Users} color="bg-orange-500" />
            </div>

            {/* Recent Activity or Graphs could go here */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
                <p>Advanced analytics and charts coming soon.</p>
            </div>
        </div>
    );
}
