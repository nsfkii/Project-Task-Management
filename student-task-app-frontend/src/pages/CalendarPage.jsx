import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Calendar as CalendarIcon } from 'lucide-react';
import api from '../api/axios';

export default function CalendarPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            
            const response = await api.get('/tasks?all=true');
            const tasks = response.data;

            // Mapping data dari API ke format yang dipahami FullCalendar
            const calendarEvents = tasks.map((task) => {
                // Menentukan warna berdasarkan prioritas
                let bgColor = '#22c55e'; // Default Hijau (Low)
                if (task.priority === 'high') bgColor = '#ef4444'; // Merah
                if (task.priority === 'medium') bgColor = '#eab308'; // Kuning

                // Jika tugas sudah selesai (Done), warnanya dibuat abu-abu/pudar
                if (task.status === 'done') bgColor = '#9ca3af';

                return {
                    id: task.id,
                    title: task.title,
                    date: task.deadline, // FullCalendar membaca YYYY-MM-DD
                    backgroundColor: bgColor,
                    borderColor: bgColor,
                    extendedProps: {
                        subject: task.subject,
                        status: task.status,
                        priority: task.priority,
                        description: task.description
                    }
                };
            });

            setEvents(calendarEvents);
        } catch (error) {
            console.error("Gagal mengambil data kalender", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    // Fungsi ketika event/tugas di kalender diklik
    const handleEventClick = (clickInfo) => {
        const { title, extendedProps } = clickInfo.event;
        
        // Kita gunakan alert bawaan browser untuk simpelnya.
        // Nanti kamu bisa ubah menjadi Modal Popup cantik seperti di Dashboard!
        alert(
            `Judul Tugas: ${title}\n` +
            `Mata Kuliah: ${extendedProps.subject}\n` +
            `Status: ${extendedProps.status.toUpperCase()}\n` +
            `Prioritas: ${extendedProps.priority.toUpperCase()}\n` +
            `Deskripsi: ${extendedProps.description || 'Tidak ada deskripsi'}`
        );
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                    <CalendarIcon size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Kalender Deadline</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Pantau jadwal pengumpulan tugas kamu di sini</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 relative z-0">
                {/* agar text kalender tetap terlihat jelas di Dark Mode 
                */}
                <style>
                    {`
                    .fc .fc-toolbar-title { font-size: 1.25rem; font-weight: bold; }
                    .fc .fc-button-primary { background-color: #2563eb !important; border-color: #2563eb !important; }
                    .fc .fc-button-primary:hover { background-color: #1d4ed8 !important; border-color: #1d4ed8 !important; }
                    .fc-theme-standard td, .fc-theme-standard th { border-color: #e5e7eb; }
                    
                    /* Tweak Dark Mode */
                    .dark .fc .fc-toolbar-title { color: white; }
                    .dark .fc-theme-standard td, .dark .fc-theme-standard th { border-color: #374151; }
                    .dark .fc .fc-daygrid-day-number { color: #d1d5db; }
                    .dark .fc .fc-col-header-cell-cushion { color: #d1d5db; }
                    .dark .fc .fc-day-today { background-color: rgba(37, 99, 235, 0.1) !important; }
                    `}
                </style>

                {loading ? (
                    <div className="flex justify-center items-center h-64 text-gray-500">Memuat kalender...</div>
                ) : (
                    <FullCalendar
                        plugins={[dayGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        events={events}
                        eventClick={handleEventClick}
                        height="auto" // Agar tinggi kalender menyesuaikan layar
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,dayGridWeek'
                        }}
                        buttonText={{
                            today: 'Hari Ini',
                            month: 'Bulan',
                            week: 'Minggu'
                        }}
                    />
                )}
            </div>
        </div>
    );
}