import { useState } from "react";

export const ApprovalModal = ({ isOpen, onClose, onConfirm, req }) => {
    const [boothNumber, setBoothNumber] = useState('');
    const [badgeFile, setBadgeFile] = useState(null);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!boothNumber) {
            toast.error("Booth number is required");
            return;
        }
        setLoading(true);
        // Prepare FormData
        const formData = new FormData();
        formData.append('action', 'APPROVE');
        formData.append('booth_number', boothNumber);
        if (badgeFile) {
            formData.append('badge', badgeFile);
        }

        await onConfirm(req.id, formData);
        setLoading(false);
        onClose();
        setBoothNumber('');
        setBadgeFile(null);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Approve Application</h3>
                <p className="text-slate-600 mb-4">Assign a booth number and upload a badge (optional) for <b>{req.company_name}</b>.</p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Booth Number *</label>
                        <input
                            type="number"
                            className="mt-1 block w-full border border-slate-300 rounded-md p-2"
                            value={boothNumber}
                            onChange={e => setBoothNumber(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Upload Badge (PDF/Image)</label>
                        <input
                            type="file"
                            className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            onChange={e => setBadgeFile(e.target.files[0])}
                        />
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                        {loading ? 'Approving...' : 'Confirm Approval'}
                    </button>
                </div>
            </div>
        </div>
    );
};
