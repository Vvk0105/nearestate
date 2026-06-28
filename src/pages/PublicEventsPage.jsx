import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EventsHomePage from '../components/EventsHomePage';

export default function PublicEventsPage() {
    const { user } = useAuth();

    return (
        <div className="space-y-10 pb-14">
            {/* Hero Banner */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 sm:p-12 text-white shadow-xl">
                <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">
                    Discover Real Estate Exhibitions
                </h1>
                <p className="text-slate-300 text-lg max-w-2xl">
                    Browse all events — ongoing, upcoming, and past. Connect with top developers,
                    brokers, and loan providers.{' '}
                    {!user && (
                        <Link to="/auth/login" className="underline text-blue-300 hover:text-blue-200 font-semibold">
                            Sign in to register.
                        </Link>
                    )}
                </p>
            </div>

            {/* Reused paginated events list */}
            <EventsHomePage
                role="public"
                showHero={false}
            />
        </div>
    );
}
