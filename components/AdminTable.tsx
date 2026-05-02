"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Pencil, Save, XCircle } from 'lucide-react';

export const AdminTable = () => {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [selected, setSelected] = useState<any | null>(null);
    const [updating, setUpdating] = useState<string | null>(null);
    const [editing, setEditing] = useState(false);
    const [editData, setEditData] = useState<any>({});
    const [confirmAction, setConfirmAction] = useState<{ id: string; status: string; name: string } | null>(null);

    useEffect(() => {
        fetchAppointments();

        const channel = supabase
            .channel('appointments_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
                fetchAppointments();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchAppointments = async () => {
        const { data } = await supabase.from('appointments').select('*').order('created_at', { ascending: false });
        if (data) setAppointments(data);
    };

    const updateAppointment = async (id: string, updates: Record<string, any>) => {
        setUpdating(id);
        try {
            const res = await fetch(`/api/appointments/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
            const result = await res.json();
            if (res.ok && result.success) {
                await fetchAppointments();
                if (selected?.id === id) {
                    setSelected({ ...selected, ...updates });
                }
                return true;
            } else {
                alert(`Failed to update: ${result.error || 'Unknown error'}`);
                return false;
            }
        } catch (err) {
            alert('Network error. Please try again.');
            return false;
        } finally {
            setUpdating(null);
        }
    };

    const handleSaveEdit = async () => {
        if (!selected) return;
        const success = await updateAppointment(selected.id, editData);
        if (success) {
            setEditing(false);
            setEditData({});
        }
    };

    const handleConfirmedAction = async () => {
        if (!confirmAction) return;
        await updateAppointment(confirmAction.id, { status: confirmAction.status });
        setConfirmAction(null);
    };

    const startEditing = () => {
        setEditing(true);
        setEditData({
            first_name: selected.first_name,
            last_name: selected.last_name,
            email: selected.email,
            phone: selected.phone,
            address: selected.address,
            city: selected.city,
            state: selected.state,
            zip: selected.zip,
            service_type: selected.service_type,
            frequency: selected.frequency,
            preferred_date: selected.preferred_date,
            preferred_time: selected.preferred_time,
            access_method: selected.access_method || '',
            pets: selected.pets || '',
            notes: selected.notes || '',
            status: selected.status,
        });
    };

    const startEditingFor = (app: any) => {
        setEditing(true);
        setEditData({
            first_name: app.first_name,
            last_name: app.last_name,
            email: app.email,
            phone: app.phone,
            address: app.address,
            city: app.city,
            state: app.state,
            zip: app.zip,
            service_type: app.service_type,
            frequency: app.frequency,
            preferred_date: app.preferred_date,
            preferred_time: app.preferred_time,
            access_method: app.access_method || '',
            pets: app.pets || '',
            notes: app.notes || '',
            status: app.status,
        });
    };

    const cancelEditing = () => {
        setEditing(false);
        setEditData({});
    };

    const formatDateTime = (date: string, time: string) => {
        const timeMap: Record<string, string> = {
            'Morning': '8:00 AM - 12:00 PM',
            'Afternoon': '1:00 PM - 5:00 PM',
        };
        const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
        });
        return `${formattedDate} \u2022 ${timeMap[time] || time}`;
    };

    const statusBadge = (status: string) => {
        const styles: Record<string, string> = {
            pending: 'bg-amber-50 text-amber-700 border-amber-200',
            confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
            cancelled: 'bg-red-50 text-red-700 border-red-200',
            done: 'bg-green-50 text-green-700 border-green-200',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
                {status.toUpperCase()}
            </span>
        );
    };

    const EditField = ({ label, field, type = 'text' }: { label: string; field: string; type?: string }) => (
        <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
            <input
                type={type}
                value={editData[field] || ''}
                onChange={(e) => setEditData({ ...editData, [field]: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
        </div>
    );

    return (
        <>
            <div className="overflow-x-auto bg-white rounded-xl shadow border border-slate-200">
                <table className="min-w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 border-b border-slate-200 font-medium text-slate-700">
                        <tr>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Service</th>
                            <th className="px-6 py-4">Date & Time</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {appointments.map((app) => (
                            <tr
                                key={app.id}
                                className="hover:bg-slate-50 cursor-pointer"
                                onClick={() => { setSelected(app); setEditing(false); setEditData({}); }}
                            >
                                <td className="px-6 py-4">
                                    <div className="font-medium text-slate-900">{app.first_name} {app.last_name}</div>
                                    <div className="text-slate-500">{app.phone}</div>
                                </td>
                                <td className="px-6 py-4 text-slate-700">{app.service_type} ({app.frequency})</td>
                                <td className="px-6 py-4 text-slate-700">{formatDateTime(app.preferred_date, app.preferred_time)}</td>
                                <td className="px-6 py-4">{statusBadge(app.status)}</td>
                                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { setSelected(app); startEditingFor(app); }}
                                            className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full hover:bg-indigo-200 transition-colors"
                                        >
                                            Edit
                                        </button>
                                        {app.status === 'pending' && (
                                            <button
                                                onClick={() => setConfirmAction({ id: app.id, status: 'confirmed', name: `${app.first_name} ${app.last_name}` })}
                                                disabled={updating === app.id}
                                                className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors disabled:opacity-50"
                                            >
                                                {updating === app.id ? '...' : 'Confirm'}
                                            </button>
                                        )}
                                        {app.status === 'confirmed' && (
                                            <button
                                                onClick={() => setConfirmAction({ id: app.id, status: 'done', name: `${app.first_name} ${app.last_name}` })}
                                                disabled={updating === app.id}
                                                className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200 transition-colors disabled:opacity-50"
                                            >
                                                {updating === app.id ? '...' : 'Mark Done'}
                                            </button>
                                        )}
                                        {app.status !== 'cancelled' && app.status !== 'done' && (
                                            <button
                                                onClick={() => setConfirmAction({ id: app.id, status: 'cancelled', name: `${app.first_name} ${app.last_name}` })}
                                                disabled={updating === app.id}
                                                className="text-sm bg-slate-100 text-slate-700 px-3 py-1 rounded-full hover:bg-slate-200 transition-colors disabled:opacity-50"
                                            >
                                                {updating === app.id ? '...' : 'Cancel'}
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {appointments.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No appointments found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Slide-over Detail/Edit Modal */}
            {selected && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => { setSelected(null); setEditing(false); }} />
                    <div className="relative w-full max-w-md bg-white shadow-2xl animate-slide-in overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
                            <h3 className="text-lg font-bold text-slate-900">
                                {editing ? 'Edit Booking' : 'Booking Details'}
                            </h3>
                            <div className="flex items-center gap-2">
                                {!editing ? (
                                    <button onClick={startEditing} className="text-blue-600 hover:text-blue-800 p-1" title="Edit">
                                        <Pencil size={18} />
                                    </button>
                                ) : (
                                    <>
                                        <button onClick={handleSaveEdit} disabled={!!updating} className="text-green-600 hover:text-green-800 p-1" title="Save">
                                            <Save size={18} />
                                        </button>
                                        <button onClick={cancelEditing} className="text-slate-400 hover:text-slate-600 p-1" title="Cancel Edit">
                                            <XCircle size={18} />
                                        </button>
                                    </>
                                )}
                                <button onClick={() => { setSelected(null); setEditing(false); }} className="text-slate-400 hover:text-slate-600 p-1">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {editing ? (
                                /* ---- EDIT MODE ---- */
                                <>
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Status</h4>
                                        <select
                                            value={editData.status}
                                            onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="done">Done</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Customer</h4>
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                <EditField label="First Name" field="first_name" />
                                                <EditField label="Last Name" field="last_name" />
                                            </div>
                                            <EditField label="Email" field="email" type="email" />
                                            <EditField label="Phone" field="phone" type="tel" />
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Location</h4>
                                        <div className="space-y-3">
                                            <EditField label="Address" field="address" />
                                            <div className="grid grid-cols-3 gap-3">
                                                <EditField label="City" field="city" />
                                                <EditField label="State" field="state" />
                                                <EditField label="ZIP" field="zip" />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Service</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Service Type</label>
                                                <select
                                                    value={editData.service_type}
                                                    onChange={(e) => setEditData({ ...editData, service_type: e.target.value })}
                                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="Standard Clean">Standard Clean</option>
                                                    <option value="Deep Clean">Deep Clean</option>
                                                    <option value="Move In/Out">Move In/Out</option>
                                                    <option value="Post-Construction">Post-Construction</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Frequency</label>
                                                <select
                                                    value={editData.frequency}
                                                    onChange={(e) => setEditData({ ...editData, frequency: e.target.value })}
                                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="One-time">One-time</option>
                                                    <option value="Weekly">Weekly</option>
                                                    <option value="Bi-weekly">Bi-weekly</option>
                                                    <option value="Monthly">Monthly</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Schedule</h4>
                                        <div className="space-y-3">
                                            <EditField label="Date" field="preferred_date" type="date" />
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Time</label>
                                                <select
                                                    value={editData.preferred_time}
                                                    onChange={(e) => setEditData({ ...editData, preferred_time: e.target.value })}
                                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="Morning">Morning (8:00 AM - 12:00 PM)</option>
                                                    <option value="Afternoon">Afternoon (1:00 PM - 5:00 PM)</option>
                                                </select>
                                            </div>
                                            <EditField label="Access Method" field="access_method" />
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Additional</h4>
                                        <div className="space-y-3">
                                            <EditField label="Pets" field="pets" />
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Notes</label>
                                                <textarea
                                                    value={editData.notes || ''}
                                                    onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                                        <button
                                            onClick={handleSaveEdit}
                                            disabled={!!updating}
                                            className="flex-1 bg-blue-600 text-white py-2.5 rounded-full font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                                        >
                                            {updating ? 'Saving...' : 'Save Changes'}
                                        </button>
                                        <button
                                            onClick={cancelEditing}
                                            className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-full font-semibold hover:bg-slate-200 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </>
                            ) : (
                                /* ---- VIEW MODE ---- */
                                <>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-slate-500">Status</span>
                                        {statusBadge(selected.status)}
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Customer</h4>
                                        <div className="space-y-2">
                                            <DetailRow label="Name" value={`${selected.first_name} ${selected.last_name}`} />
                                            <DetailRow label="Email" value={selected.email} />
                                            <DetailRow label="Phone" value={selected.phone} />
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Property</h4>
                                        <div className="space-y-2">
                                            <DetailRow label="Type" value={selected.property_type} />
                                            <DetailRow label="Address" value={`${selected.address}, ${selected.city}, ${selected.state} ${selected.zip}`} />
                                            {selected.bedrooms && <DetailRow label="Bedrooms" value={selected.bedrooms} />}
                                            {selected.bathrooms && <DetailRow label="Bathrooms" value={selected.bathrooms} />}
                                            {selected.office_size && <DetailRow label="Office Size" value={selected.office_size} />}
                                            {selected.floors && <DetailRow label="Floors" value={selected.floors} />}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Service</h4>
                                        <div className="space-y-2">
                                            <DetailRow label="Type" value={selected.service_type} />
                                            <DetailRow label="Frequency" value={selected.frequency} />
                                            {selected.addons?.length > 0 && <DetailRow label="Add-ons" value={selected.addons.join(', ')} />}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Schedule</h4>
                                        <div className="space-y-2">
                                            <DetailRow label="Date" value={selected.preferred_date} />
                                            <DetailRow label="Time" value={selected.preferred_time} />
                                            {selected.alternate_date && <DetailRow label="Alternate Date" value={selected.alternate_date} />}
                                            {selected.access_method && <DetailRow label="Access" value={selected.access_method} />}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Additional</h4>
                                        <div className="space-y-2">
                                            {selected.pets && <DetailRow label="Pets" value={selected.pets} />}
                                            {selected.product_preference && <DetailRow label="Products" value={selected.product_preference} />}
                                            {selected.notes && <DetailRow label="Notes" value={selected.notes} />}
                                            <DetailRow label="Booked" value={new Date(selected.created_at).toLocaleString()} />
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                                        {selected.status === 'pending' && (
                                            <button
                                                onClick={() => setConfirmAction({ id: selected.id, status: 'confirmed', name: `${selected.first_name} ${selected.last_name}` })}
                                                disabled={!!updating}
                                                className="flex-1 bg-blue-600 text-white py-2 rounded-full font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                                            >
                                                {updating ? 'Updating...' : 'Confirm Booking'}
                                            </button>
                                        )}
                                        {selected.status === 'confirmed' && (
                                            <button
                                                onClick={() => setConfirmAction({ id: selected.id, status: 'done', name: `${selected.first_name} ${selected.last_name}` })}
                                                disabled={!!updating}
                                                className="flex-1 bg-green-600 text-white py-2 rounded-full font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                                            >
                                                {updating ? 'Updating...' : 'Mark as Done'}
                                            </button>
                                        )}
                                        {selected.status !== 'cancelled' && selected.status !== 'done' && (
                                            <button
                                                onClick={() => setConfirmAction({ id: selected.id, status: 'cancelled', name: `${selected.first_name} ${selected.last_name}` })}
                                                disabled={!!updating}
                                                className="flex-1 bg-red-50 text-red-700 border border-red-200 py-2 rounded-full font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
                                            >
                                                {updating ? 'Updating...' : 'Cancel Booking'}
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmAction && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmAction(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">
                            {confirmAction.status === 'confirmed' ? 'Confirm Booking?' :
                                confirmAction.status === 'cancelled' ? 'Cancel Booking?' :
                                    'Mark as Done?'}
                        </h3>
                        <p className="text-sm text-slate-600 mb-6">
                            {confirmAction.status === 'confirmed'
                                ? `Are you sure you want to confirm the booking for ${confirmAction.name}?`
                                : confirmAction.status === 'cancelled'
                                    ? `Are you sure you want to cancel the booking for ${confirmAction.name}? This action cannot be undone.`
                                    : `Are you sure you want to mark the booking for ${confirmAction.name} as done?`}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmAction(null)}
                                className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-full font-semibold hover:bg-slate-200 transition-colors"
                            >
                                Go Back
                            </button>
                            <button
                                onClick={handleConfirmedAction}
                                disabled={!!updating}
                                className={`flex-1 text-white py-2.5 rounded-full font-semibold transition-colors disabled:opacity-50 ${confirmAction.status === 'cancelled'
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : confirmAction.status === 'confirmed'
                                        ? 'bg-blue-600 hover:bg-blue-700'
                                        : 'bg-green-600 hover:bg-green-700'
                                    }`}
                            >
                                {updating ? 'Processing...' :
                                    confirmAction.status === 'confirmed' ? 'Yes, Confirm' :
                                        confirmAction.status === 'cancelled' ? 'Yes, Cancel' :
                                            'Yes, Mark Done'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between">
        <span className="text-sm text-slate-500">{label}</span>
        <span className="text-sm font-medium text-slate-900 text-right max-w-[60%]">{value}</span>
    </div>
);
