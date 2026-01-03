import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ApplicationFormPage() {
    const { id } = useParams(); // Exhibition ID
    const { apiClient } = useAuth();
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [transactionId, setTransactionId] = useState('');
    const [boothNumber, setBoothNumber] = useState('');
    const [loading, setLoading] = useState(false);

    // Note: Booth number might be assigned by Admin, but if Exhibitor requests, maybe?
    // Model `ExhibitorApplication`: payment_screenshot, transaction_id, booth_number (blank=True)

    const handleFileChange = (e) => {
        if (e.target.files[0]) setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            toast.error("Please upload a payment screenshot.");
            return;
        }
        setLoading(true);

        const formData = new FormData();
        formData.append('payment_screenshot', file);
        formData.append('transaction_id', transactionId);
        if (boothNumber) formData.append('booth_number', boothNumber);

        try {
            await apiClient.post(`/exhibitions/exhibitor/apply/${id}/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Application submitted successfully!");
            navigate('/exhibitor/applications');
        } catch (error) {
            console.error(error);
            toast.error("Application failed. You may have already applied.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto py-12 px-4">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Submit Application</h1>

            <div className="bg-white rounded-xl shadow border border-slate-200 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* File Upload */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Payment Screenshot</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                {file ? (
                                    <div className="text-sm text-slate-600">
                                        <p className="font-bold text-green-600">{file.name}</p>
                                        <button type="button" onClick={() => setFile(null)} className="text-red-500 text-xs mt-2 hover:underline">Remove</button>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="mx-auto h-12 w-12 text-slate-400" />
                                        <div className="flex text-sm text-slate-600">
                                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                                <span>Upload a file</span>
                                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                                            </label>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-slate-500">PNG, JPG up to 10MB</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Transaction ID (Optional)</label>
                        <input
                            type="text"
                            className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Requested Booth Number (Optional)</label>
                        <input
                            type="number"
                            className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={boothNumber}
                            onChange={(e) => setBoothNumber(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="flex-1 py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
