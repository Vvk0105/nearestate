import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Mail, Clock } from 'lucide-react';

export default function PaymentSuccessPage() {
    useEffect(() => {
        // Scroll to top on mount
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                {/* Animated check icon */}
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <CheckCircle size={52} className="text-green-600" strokeWidth={1.5} />
                </div>

                <h1 className="text-3xl font-bold text-slate-900 mb-3">Payment Successful!</h1>
                <p className="text-slate-600 mb-6 leading-relaxed">
                    Your exhibitor registration is confirmed. We're generating your badge and you'll receive a confirmation email shortly.
                </p>

                {/* Info cards */}
                <div className="space-y-3 mb-8 text-left">
                    <div className="flex items-start gap-3 bg-white rounded-xl p-4 border border-green-100 shadow-sm">
                        <Mail size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-slate-800 text-sm">Confirmation Email Sent</p>
                            <p className="text-slate-500 text-xs mt-0.5">
                                Check your inbox for a booking confirmation with your exhibitor badge attached.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 bg-white rounded-xl p-4 border border-blue-100 shadow-sm">
                        <Clock size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-slate-800 text-sm">Booth Number Assignment</p>
                            <p className="text-slate-500 text-xs mt-0.5">
                                Your booth number will be assigned by the organiser. You'll receive another email with your updated badge once it's ready.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        to="/exhibitor/applications"
                        className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-sm"
                    >
                        View My Registrations
                    </Link>
                    <Link
                        to="/exhibitor/home"
                        className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                    >
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
