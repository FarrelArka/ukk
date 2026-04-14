'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Edit2, Trash2, Mail, Phone, Star } from 'lucide-react';

type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  joinedDate: string;
  totalBookings: number;
  totalSpent: string;
  bio?: string;
};

export default function UserView({ user }: { user: User }) {
  const [status, setStatus] = useState(user.status);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const toggleStatus = async () => {
    if (!confirm(`Ubah status user ${user.name}?`)) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: status === 'active' ? 'inactive' : 'active' })
      });
      if (!res.ok) throw new Error('Gagal update status');
      const updated = await res.json();
      setStatus(updated.status);
      setMessage('Status berhasil diubah');
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Terjadi kesalahan');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-gray-700 font-bold text-xl shadow-sm">
            {user.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
            <p className="text-sm text-gray-500">{user.bio}</p>
            <div className="mt-2 flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                {status}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{user.role}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/admin/users/${user.id}/edit`} className="px-4 py-2 bg-yellow-50 text-[#b7862c] rounded-lg font-semibold flex items-center gap-2 hover:opacity-95">
            <Edit2 className="w-4 h-4" />
            Edit
          </Link>
          <button onClick={toggleStatus} disabled={saving} className="px-4 py-2 bg-red-50 text-red-700 rounded-lg font-semibold hover:bg-red-100">
            <Trash2 className="w-4 h-4" />
            {status === 'active' ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="col-span-2">
          <h4 className="text-sm font-semibold text-gray-600 mb-2">Contact</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-700">{user.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-700">{user.phone}</span>
            </div>
          </div>

          <h4 className="text-sm font-semibold text-gray-600 mt-4 mb-2">About</h4>
          <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-4">{user.bio || 'No bio provided.'}</p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-600 mb-2">Stats</h4>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Total Bookings</span>
              <span className="font-semibold text-gray-900">{user.totalBookings}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Total Spent</span>
              <span className="font-semibold text-gray-900">{user.totalSpent}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Joined</span>
              <span className="font-semibold text-gray-900">{user.joinedDate}</span>
            </div>
          </div>
        </div>
      </div>

      {message && <div className="mt-4 text-sm text-green-700">{message}</div>}
    </div>
  );
}
