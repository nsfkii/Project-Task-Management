import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Footer from './Footer';
import api from '../api/axios';

export default function Layout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { userProfile, updateUserProfile } = useContext(AuthContext);
    
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    // Pre-fetch profile data saat layout dimuat (hanya sekali)
    useEffect(() => {
        const fetchProfileData = async () => {
            // Hanya fetch jika userProfile belum ada
            if (!userProfile) {
                try {
                    const response = await api.get('/user');
                    updateUserProfile(response.data);
                } catch (error) {
                    console.error("Gagal pre-fetch profile:", error);
                }
            }
        };
        
        fetchProfileData();
    }, [userProfile, updateUserProfile]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex transition-colors duration-300 relative">
            {/* Overlay untuk mobile saat sidebar terbuka */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                    onClick={closeSidebar}
                />
            )}
            
            <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
            
            <main className="flex-1 flex flex-col min-w-0">
                <Topbar onToggleSidebar={toggleSidebar} />
                
                {/* Content dengan max-width dan center */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8">
                    <div className="max-w-5xl mx-auto w-full">
                        {children}
                    </div>
                </div>
                
                <Footer /> 
            </main>
        </div>
    );
}