"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { AdminTable } from '@/components/AdminTable';

export default function AdminDashboard() {
    const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, done: 0, cancelled: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            const { data } = await supabase.from('appointments').select('status');
            if (data) {
                setStats({
                    total: data.length,
                    pending: data.filter(d => d.status === 'pending').length,
                    confirmed: data.filter(d => d.status === 'confirmed').length,
                    done: data.filter(d => d.status === 'done').length,
                    cancelled: data.filter(d => d.status === 'cancelled').length,
                });
            }
        };

        fetchStats();

        const channel = supabase
            .channel('stats_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
                fetchStats();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <main className="p-4 sm:p-8 max-w-7xl mx-auto border-t-0">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-sm font-medium text-slate-500 mb-1">Total</p>
                    <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                </div>
                <div className="bg-amber-50 p-6 rounded-xl border border-amber-100 shadow-sm">
                    <p className="text-sm font-medium text-amber-700 mb-1">Pending</p>
                    <p className="text-3xl font-bold text-amber-900">{stats.pending}</p>
                </div>
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 shadow-sm">
                    <p className="text-sm font-medium text-blue-700 mb-1">Confirmed</p>
                    <p className="text-3xl font-bold text-blue-900">{stats.confirmed}</p>
                </div>
                <div className="bg-green-50 p-6 rounded-xl border border-green-100 shadow-sm">
                    <p className="text-sm font-medium text-green-700 mb-1">Done</p>
                    <p className="text-3xl font-bold text-green-900">{stats.done}</p>
                </div>
                <div className="bg-red-50 p-6 rounded-xl border border-red-100 shadow-sm">
                    <p className="text-sm font-medium text-red-700 mb-1">Cancelled</p>
                    <p className="text-3xl font-bold text-red-900">{stats.cancelled}</p>
                </div>
            </div>

            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-900">Recent Bookings</h2>
                <a href="/book" target="_blank" className="bg-primary text-white hover:bg-blue-700 px-4 py-2 rounded-full text-sm font-semibold transition-colors">
                    + Create Appointment
                </a>
            </div>
            <AdminTable />
        </main>
    );
}
