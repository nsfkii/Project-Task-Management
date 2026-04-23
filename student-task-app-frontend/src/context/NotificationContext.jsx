import { createContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);

    const addNotification = useCallback((notification) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { ...notification, id }]);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    return (
        <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
            {children}
            {/* Notification display */}
            {notifications.length > 0 && (
                <div className="fixed top-4 right-4 z-50 space-y-2">
                    {notifications.map(notification => (
                        <div 
                            key={notification.id}
                            className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 min-w-[300px] flex items-center justify-between animate-slideIn"
                        >
                            <p className="text-sm text-slate-800 dark:text-white">{notification.message}</p>
                            <button 
                                onClick={() => removeNotification(notification.id)}
                                className="ml-4 text-slate-400 hover:text-slate-600"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </NotificationContext.Provider>
    );
}

