import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ImageCarousel from './ImageCarousel';

// Derive status badge from event dates
function getEventStatus(event) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(event.start_date);
    const end = new Date(event.end_date);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    if (end < today) return 'past';
    if (start <= today && end >= today) return 'ongoing';
    return 'upcoming';
}

const STATUS_STYLES = {
    upcoming: { label: 'Upcoming', bg: 'bg-blue-100 text-blue-800' },
    ongoing:  { label: 'Ongoing',  bg: 'bg-green-100 text-green-800' },
    past:     { label: 'Past',     bg: 'bg-slate-100 text-slate-500' },
};

export default function EventCard({ event, action, linkOverride }) {
    const MEDIA_BASE = import.meta.env.VITE_MEDIA_BASE_URL;
    // Use pre-classified status if set (from filtered lists), otherwise derive it
    const status = event._status || getEventStatus(event);
    const { label, bg } = STATUS_STYLES[status];

    return (
        <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full ${status === 'past' ? 'opacity-80' : ''}`}>
            <div className="h-48 overflow-hidden bg-slate-100 relative">
                {event.images ? (
                    <ImageCarousel
                        images={event.images.map((img) => ({
                            id: img.id,
                            image: img.image.startsWith('http')
                                ? img.image
                                : `${MEDIA_BASE}${img.image}`,
                        }))}
                        height="h-full"
                        rounded="rounded-none"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <span className="text-4xl font-bold opacity-20">EVENT</span>
                    </div>
                )}
                {/* Status badge */}
                <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${bg}`}>
                        {label}
                    </span>
                </div>
                {/* Grayscale overlay for past events */}
                {status === 'past' && (
                    <div className="absolute inset-0 bg-slate-900/10" />
                )}
            </div>

            <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">{event.name}</h3>
                <p className="text-slate-600 text-sm mb-4 line-clamp-2 flex-1">
                    {event.description}
                </p>

                <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-slate-500">
                        <Calendar size={16} className="mr-2 text-blue-500" />
                        <span>{new Date(event.start_date).toLocaleDateString()} – {new Date(event.end_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-500">
                        <MapPin size={16} className="mr-2 text-red-500" />
                        <span>{event.city}, {event.venue}</span>
                    </div>
                </div>

                {/* Custom action or default link */}
                {action ? (
                    action
                ) : (
                    <Link
                        to={linkOverride || `/visitor/events/${event.id}`}
                        className={`w-full flex items-center justify-center gap-2 py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            status === 'past'
                                ? 'bg-slate-500 hover:bg-slate-600 focus:ring-slate-500'
                                : 'bg-slate-900 hover:bg-slate-800 focus:ring-slate-900'
                        }`}
                    >
                        {status === 'past' ? 'View Details' : 'View Details'} <ArrowRight size={16} />
                    </Link>
                )}
            </div>
        </div>
    );
}
