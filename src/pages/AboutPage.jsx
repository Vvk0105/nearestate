import React from 'react';
import { Building2, Target, Award, ShieldCheck, Users2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
    return (
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16 space-y-16 animate-fade-in">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 text-white p-8 md:p-16 shadow-2xl">
                {/* Background decorative blobs */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
                
                <div className="relative z-10 max-w-3xl space-y-6">
                    <span className="inline-block px-3 py-1 bg-blue-500/80 text-white text-xs font-bold rounded-full uppercase tracking-wider backdrop-blur-sm">
                        About NearEstate
                    </span>
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
                        Connecting the Property & Construction Ecosystem
                    </h1>
                    <p className="text-slate-300 text-base md:text-lg leading-relaxed">
                        NearEstate Australia is a real estate exhibition and business networking platform connecting key players through high-quality property expos and industry events across Australia.
                    </p>
                </div>
            </div>

            {/* Core Info / Two-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-stretch">
                {/* Who We Are Card */}
                <div className="bg-white rounded-2xl p-6 md:p-10 border border-slate-200/60 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
                    <div className="space-y-6">
                        <div className="inline-flex items-center justify-center p-3 rounded-xl bg-blue-50 text-blue-600">
                            <Building2 size={28} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Who We Are</h2>
                        <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                            NearEstate Australia is a real estate exhibition and business networking platform connecting residential and commercial property developers, home buyers, property investors, builders, real estate agencies, finance professionals, architects, consultants, suppliers, manufacturers, subcontractors, and property service providers through high-quality property expos and industry events across Australia.
                        </p>
                    </div>
                    <div className="pt-6 border-t border-slate-100 mt-6">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Serving Australia Nationwide</span>
                    </div>
                </div>

                {/* Our Mission Card */}
                <div className="bg-white rounded-2xl p-6 md:p-10 border border-slate-200/60 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
                    <div className="space-y-6">
                        <div className="inline-flex items-center justify-center p-3 rounded-xl bg-indigo-50 text-indigo-600">
                            <Target size={28} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Our Mission</h2>
                        <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                            Our mission is to bring the entire Australian property and construction ecosystem together under one roof, creating opportunities to showcase products and services, generate business, share knowledge, and build lasting partnerships.
                        </p>
                    </div>
                    <div className="pt-6 border-t border-slate-100 mt-6">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Building Lasting Partnerships</span>
                    </div>
                </div>
            </div>

            {/* Why Choose Us / Networking Section */}
            <div className="space-y-8">
                <div className="text-center space-y-3">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">Why NearEstate?</h2>
                    <p className="text-slate-500 text-sm md:text-base max-w-xl mx-auto">
                        We foster a highly collaborative environment to grow your brand and network within the industry.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Feature 1 */}
                    <div className="bg-white rounded-xl p-6 border border-slate-200/50 shadow-sm space-y-4 hover:-translate-y-1 transition-all duration-300">
                        <div className="inline-flex items-center justify-center p-2 rounded-lg bg-green-50 text-green-600">
                            <Users2 size={20} />
                        </div>
                        <h3 className="font-bold text-slate-900">Active Networking</h3>
                        <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
                            Interact face-to-face with investors, developers, and industry professionals from various segments of the real estate value chain.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="bg-white rounded-xl p-6 border border-slate-200/50 shadow-sm space-y-4 hover:-translate-y-1 transition-all duration-300">
                        <div className="inline-flex items-center justify-center p-2 rounded-lg bg-blue-50 text-blue-600">
                            <Award size={20} />
                        </div>
                        <h3 className="font-bold text-slate-900">Showcase Products</h3>
                        <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
                            Display your commercial properties, housing developments, finance solutions, or building materials to a targeted audience.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="bg-white rounded-xl p-6 border border-slate-200/50 shadow-sm space-y-4 hover:-translate-y-1 transition-all duration-300">
                        <div className="inline-flex items-center justify-center p-2 rounded-lg bg-purple-50 text-purple-600">
                            <ShieldCheck size={20} />
                        </div>
                        <h3 className="font-bold text-slate-900">Trusted Platform</h3>
                        <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
                            NearEstate events are managed to the highest standard, ensuring smooth check-ins and genuine business engagement.
                        </p>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-slate-900 rounded-2xl p-8 md:p-12 text-center text-white space-y-6 shadow-lg">
                <h3 className="text-xl md:text-2xl font-bold">Ready to participate in our next event?</h3>
                <p className="text-slate-400 text-sm md:text-base max-w-lg mx-auto">
                    Create an account or login to browse upcoming exhibitions, register as a visitor, or apply for an exhibitor booth.
                </p>
                <div className="flex justify-center gap-4 flex-wrap">
                    <Link to="/events" className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all">
                        Browse Events <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
