import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ImageCarousel from './ImageCarousel';

export default function EventCard({ event, action }) {
    const API_BASE = 'http://127.0.0.1:8000/';
    const isUpcoming = new Date(event.start_date) > new Date();
    
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
            <div className="h-48 overflow-hidden bg-slate-100 relative">
                {event.images ? (
                    <ImageCarousel
                        images={event.images.map((img, i) => ({
                        id: img.id,
                        image: img.image.startsWith("http")
                            ? img.image
                            : `${API_BASE}${img.image}`,
                        }))}
                        height="h-full"
                        rounded="rounded-none"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <span className="text-4xl font-bold opacity-20">EVENT</span>
                    </div>
                )}
                <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${isUpcoming
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                        }`}>
                        {isUpcoming ? 'Upcoming' : 'Ongoing'}
                    </span>
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">{event.name}</h3>
                <p className="text-slate-600 text-sm mb-4 line-clamp-2 flex-1">
                    {event.description}
                </p>

                <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-slate-500">
                        <Calendar size={16} className="mr-2 text-blue-500" />
                        <span>{new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-500">
                        <MapPin size={16} className="mr-2 text-red-500" />
                        <span>{event.city}, {event.venue}</span>
                    </div>
                </div>

                {/* Custom Action or Default Button */}
                {action ? (
                    action
                ) : (
                    <Link
                        to={`/visitor/events/${event.id}`}
                        className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
                    >
                        View Details <ArrowRight size={16} />
                    </Link>
                )}
            </div>
        </div>
    );
}
