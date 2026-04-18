import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, Mail, Phone, Clock, MapPin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-slate-900 text-white pt-16 pb-8 border-t border-slate-800">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-[20rem] mb-12 ml-12">
                    {/* Brand & Social */}
                    <div className="space-y-6">
                        <Link to="/" className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-white">
                                NearEstate.com
                            </span>
                        </Link>
                        <p className="text-slate-400 leading-relaxed max-w-sm">
                            Connecting real estate professionals and enthusiasts through local exhibitions across Australian towns and cities.
                        </p>
                        <div className="flex gap-4">
                            <a href="https://www.facebook.com/NearEstatecom" className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors text-white">
                                <Facebook size={20} />
                            </a>
                            <a href="https://www.instagram.com/nearestate/" className="w-10 h-10 rounded-full bg-pink-600 flex items-center justify-center hover:bg-pink-700 transition-colors text-white">
                                <Instagram size={20} />
                            </a>
                            <a href="https://www.linkedin.com/company/nearestate-com/" className="w-10 h-10 rounded-full bg-blue-800 flex items-center justify-center hover:bg-blue-900 transition-colors text-white">
                                <Linkedin size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-white">Contact Information</h3>
                        <ul className="space-y-4 text-slate-400">
                            <li className="flex items-start gap-3">
                                <MapPin className="mt-1 text-blue-500 shrink-0" size={18} />
                                <span>Pakenham, VIC 3810, Victoria, Australia</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="text-blue-500 shrink-0" size={18} />
                                <span>+61 426 535 177</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="text-blue-500 shrink-0" size={18} />
                                <span>info@nearestate.com</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Clock className="text-blue-500 shrink-0" size={18} />
                                <span>Mon-Sunday: 7AM - 9PM AEST</span>
                            </li>
                        </ul>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-white">Quick Links</h3>
                        <ul className="space-y-3 text-slate-400">
                            <li><Link to="/" className="hover:text-blue-400 transition-colors">Home</Link></li>
                            <li><Link to="/auth/login" className="hover:text-blue-400 transition-colors">Exhibitions</Link></li>
                            <li><Link to="/auth/login" className="hover:text-blue-400 transition-colors">Register</Link></li>
                            <li><Link to="/" className="hover:text-blue-400 transition-colors">About Us</Link></li>
                            <li><Link to="/" className="hover:text-blue-400 transition-colors">FAQ</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-8 text-center text-slate-500 text-sm">
                    &copy; {new Date().getFullYear()} NearEstate.com. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
