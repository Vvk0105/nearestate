import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function PaymentCancelPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const exhibitionId = searchParams.get('exhibition_id');

    const handleTryAgain = () => {
        if (exhibitionId) {
            // Go back to the specific checkout page for this event
            navigate(`/exhibitor/checkout/${exhibitionId}`);
        } else {
            // Fallback: go to browse events
            navigate('/exhibitor/applications/new');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <XCircle size={52} className="text-red-500" strokeWidth={1.5} />
                </div>

                <h1 className="text-3xl font-bold text-slate-900 mb-3">Payment Cancelled</h1>
                <p className="text-slate-600 mb-8 leading-relaxed">
                    Your payment was not completed. No charge has been made. You can go back and try again whenever you're ready.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={handleTryAgain}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <RefreshCw size={16} />
                        Try Again
                    </button>
                    <Link
                        to="/exhibitor/home"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
