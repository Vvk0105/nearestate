import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, Mail, Phone, Clock, MapPin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-slate-900 text-white pt-12 pb-6 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-10">

                    {/* Brand & Social */}
                    <div className="space-y-5">
                        <Link to="/" className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-white">NearEstate.com</span>
                        </Link>
                        <p className="text-slate-400 leading-relaxed text-sm">
                            Connecting real estate professionals and enthusiasts through local exhibitions across Australian towns and cities.
                        </p>
                        <div className="flex gap-3">
                            <a href="https://www.facebook.com/NearEstatecom" target="_blank" rel="noreferrer"
                                className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors text-white">
                                <Facebook size={18} />
                            </a>
                            <a href="https://www.instagram.com/nearestate/" target="_blank" rel="noreferrer"
                                className="w-9 h-9 rounded-full bg-pink-600 flex items-center justify-center hover:bg-pink-700 transition-colors text-white">
                                <Instagram size={18} />
                            </a>
                            <a href="https://www.linkedin.com/company/nearestate-com/" target="_blank" rel="noreferrer"
                                className="w-9 h-9 rounded-full bg-blue-800 flex items-center justify-center hover:bg-blue-900 transition-colors text-white">
                                <Linkedin size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-5">
                        <h3 className="text-base font-bold text-white">Contact Information</h3>
                        <ul className="space-y-3 text-slate-400 text-sm">
                            <li className="flex items-start gap-3">
                                <MapPin className="mt-0.5 text-blue-500 shrink-0" size={16} />
                                <span>Pakenham, VIC 3810, Victoria, Australia</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="text-blue-500 shrink-0" size={16} />
                                <span>+61 426 535 177</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="text-blue-500 shrink-0" size={16} />
                                <span>info@nearestate.com</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Clock className="text-blue-500 shrink-0" size={16} />
                                <span>Mon–Sunday: 7AM – 9PM AEST</span>
                            </li>
                        </ul>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-5">
                        <h3 className="text-base font-bold text-white">Quick Links</h3>
                        <ul className="space-y-2 text-slate-400 text-sm">
                            <li><Link to="/" className="hover:text-blue-400 transition-colors">Home</Link></li>
                            <li><Link to="/events" className="hover:text-blue-400 transition-colors">Exhibitions</Link></li>
                            <li><Link to="/auth/login" className="hover:text-blue-400 transition-colors">Register</Link></li>
                            <li><Link to="/" className="hover:text-blue-400 transition-colors">About Us</Link></li>
                            <li><Link to="/" className="hover:text-blue-400 transition-colors">FAQ</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-6 text-center text-slate-500 text-sm">
                    © {new Date().getFullYear()} NearEstate.com. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
