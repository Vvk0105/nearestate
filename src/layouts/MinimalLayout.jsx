import { Outlet } from 'react-router-dom';
import Footer from '../components/Footer';

export default function MinimalLayout() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <div className="flex-1 flex flex-col justify-center items-center p-4">
                <div className="w-full max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </div>
            <Footer />
        </div>
    );
}
