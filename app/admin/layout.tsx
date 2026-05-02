"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session && pathname !== '/admin/login') {
                router.push('/admin/login');
            } else {
                setIsLoading(false);
            }
        };
        checkAuth();
    }, [pathname, router]);

    if (isLoading) return null;

    return (
        <div className="min-h-screen bg-slate-50">
            {pathname !== '/admin/login' && (
                <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                    <h1 className="font-bold text-xl text-slate-900">JILK integrated Services (Admin)</h1>
                    <button
                        onClick={async () => { await supabase.auth.signOut(); router.push('/admin/login'); }}
                        className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                    >
                        Sign out
                    </button>
                </nav>
            )}
            {children}
        </div>
    );
}
