import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, publicApiClient } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { CreditCard, CheckCircle, ArrowLeft, Zap } from 'lucide-react';

export default function CheckoutPage() {
    const { id } = useParams();          // exhibition_id
    const { apiClient } = useAuth();
    const navigate = useNavigate();

    const [event, setEvent]           = useState(null);
    const [selectedTier, setSelectedTier] = useState(null);
    const [loading, setLoading]       = useState(true);
    const [paying, setPaying]         = useState(false);

    useEffect(() => {
        publicApiClient.get(`/exhibitions/public/exhibitions/${id}/`)
            .then(res => { setEvent(res.data); setLoading(false); })
            .catch(() => { toast.error('Failed to load event'); setLoading(false); });
    }, [id]);

    const handlePay = async () => {
        if (!selectedTier) {
            toast.error('Please select a pricing plan first');
            return;
        }
        setPaying(true);
        try {
            const res = await apiClient.post(
                `/exhibitions/exhibitor/create-checkout-session/${id}/`,
                { tier_id: selectedTier.id }
            );
            // Redirect to Stripe-hosted checkout page
            window.location.href = res.data.session_url;
        } catch (err) {
            toast.error(err.response?.data?.error || 'Payment initiation failed');
            setPaying(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen flex items-center justify-center text-slate-500">
                Event not found.
            </div>
        );
    }

    const hasTiers = event.price_tiers && event.price_tiers.length > 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Back */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-8 transition-colors text-sm"
                >
                    <ArrowLeft size={16} /> Back
                </button>

                {/* Event Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-1">Exhibitor Registration</p>
                    <h1 className="text-2xl font-bold text-slate-900 mb-1">{event.name}</h1>
                    <p className="text-slate-500 text-sm">
                        {new Date(event.start_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
                        {' – '}
                        {new Date(event.end_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
                        {'  ·  '}{event.venue}, {event.city}
                    </p>
                </div>

                {/* Plan Selection */}
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Zap size={18} className="text-blue-500" />
                        Select Your Plan
                    </h2>

                    {!hasTiers ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-yellow-800 text-sm">
                            No pricing tiers have been configured for this event yet. Please contact the organiser.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {event.price_tiers.map(tier => {
                                const isSelected = selectedTier?.id === tier.id;
                                return (
                                    <button
                                        key={tier.id}
                                        onClick={() => setSelectedTier(tier)}
                                        className={`w-full text-left rounded-2xl border-2 p-5 transition-all duration-200 ${
                                            isSelected
                                                ? 'border-blue-600 bg-blue-50 shadow-md'
                                                : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                                    isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                                                }`}>
                                                    {isSelected && <CheckCircle size={14} className="text-white" />}
                                                </div>
                                                <div>
                                                    <p className={`font-semibold text-base ${isSelected ? 'text-blue-800' : 'text-slate-800'}`}>
                                                        {tier.name}
                                                    </p>
                                                    {tier.description && (
                                                        <p className="text-sm text-slate-500 mt-0.5">{tier.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className={`text-right ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>
                                                <p className="text-2xl font-extrabold">
                                                    {tier.currency_symbol || '₹'}{tier.fee.toLocaleString()}
                                                </p>
                                                <p className="text-xs text-slate-400 uppercase">{tier.currency_code}</p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Summary + Pay Button */}
                {selectedTier && (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
                        <h3 className="font-semibold text-slate-700 mb-3">Order Summary</h3>
                        <div className="flex justify-between items-center text-sm text-slate-600 mb-2">
                            <span>{selectedTier.name} — {event.name}</span>
                            <span>{selectedTier.currency_symbol}{selectedTier.fee.toLocaleString()}</span>
                        </div>
                        <hr className="my-3 border-slate-100" />
                        <div className="flex justify-between items-center font-bold text-slate-900">
                            <span>Total</span>
                            <span className="text-lg">{selectedTier.currency_symbol}{selectedTier.fee.toLocaleString()} {selectedTier.currency_code}</span>
                        </div>
                    </div>
                )}

                <button
                    onClick={handlePay}
                    disabled={!hasTiers || paying}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-2xl font-semibold text-base shadow-md hover:shadow-lg transition-all duration-200"
                >
                    {paying ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Redirecting to Stripe…
                        </>
                    ) : (
                        <>
                            <CreditCard size={20} />
                            Proceed to Secure Payment
                        </>
                    )}
                </button>

                <p className="text-center text-xs text-slate-400 mt-4">
                    🔒 Payments are processed securely by Stripe. We never store your card details.
                </p>
            </div>
        </div>
    );
}
