import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import EventsHomePage from '../../components/EventsHomePage';
import toast from 'react-hot-toast';

export default function ExhibitorHome() {
    const { apiClient, loading: authLoading } = useAuth();
    const [events, setEvents] = useState([]);
    const [myApplications, setMyApplications] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;

        const fetchData = async () => {
            try {
                const [eventsRes, appsRes, profileRes] = await Promise.all([
                    apiClient.get('/exhibitions/public/exhibitions/'),
                    apiClient.get('/exhibitions/exhibitor/my-applications/'),
                    apiClient.get('/exhibitions/exhibitor/profile/status/'),
                ]);

                setEvents(eventsRes.data.data || eventsRes.data);
                setMyApplications(appsRes.data);

                if (profileRes.data.exists) {
                    try {
                        const detailRes = await apiClient.get('/exhibitions/exhibitor/profile/');
                        setProfile(detailRes.data);
                    } catch { /* profile details unavailable */ }
                }
            } catch (error) {
                console.error('Failed to fetch exhibitor data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authLoading]);

    const handleProfileSaved = async (formData) => {
        const res = await apiClient.patch('/exhibitions/exhibitor/profile/', formData);
        setProfile(res.data);
        toast.success('Company profile updated!');
        return res.data;
    };

    return (
        <EventsHomePage
            events={events}
            loading={loading || authLoading}
            role="exhibitor"
            myApplications={myApplications}
            profile={profile}
            apiClient={apiClient}
            onProfileSaved={handleProfileSaved}
        />
    );
}
