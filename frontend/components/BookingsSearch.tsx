'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Search, Trash2, Filter, Loader2, AlertCircle
} from 'lucide-react';
import SearchBar from './SearchBar';

interface Booking {
  id_booking: number;
  user_id: number;
  user_name: string;
  email: string;
  unit_id: number;
  unit_name: string;
  check_in: string;
  check_out: string;
  jumlah_orang: number;
  status_booking: string;
  invoice: string;
  payment_status: string;
  amount: number;
}

const API_BASE = 'http://localhost:5050/api/admin/bookings';

function getToken(): string {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams(window.location.search);
  const urlToken = params.get('token');
  if (urlToken) return urlToken;
  return localStorage.getItem('token') ?? '';
}

export default function BookingsSearch() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingSearch, setBookingSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(API_BASE, {
        method: 'GET',
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Gagal mengambil data bookings');
      }
      const data: Booking[] = await res.json();
      setBookings(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const deleteBooking = async (id: number) => {
    if (!confirm('Hapus permanen booking ini? Aksi ini akan langsung menghapus data dari database.')) return;
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Gagal menghapus booking');
      }
      setBookings(prev => prev.filter(b => b.id_booking !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menghapus booking');
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      return (
        booking.user_name?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        booking.unit_name?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        booking.email?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        booking.invoice?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        booking.id_booking.toString().includes(bookingSearch)
      );
    });
  }, [bookingSearch, bookings]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-orange-100 text-orange-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bookings Management</h2>
          <p className="text-sm text-gray-600 mt-1">Manage all your property bookings</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <SearchBar
          value={bookingSearch}
          onChange={setBookingSearch}
          placeholder="Search bookings by user, unit, email, invoice, or ID..."
        />
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
          <button
            onClick={fetchBookings}
            className="ml-auto text-sm underline hover:no-underline"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* Results Count */}
      {bookingSearch && (
        <div className="flex items-center gap-2 text-sm">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-gray-600">
            Found <span className="font-semibold text-gray-900">{filteredBookings.length}</span> result{filteredBookings.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID / Invoice</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Unit</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Dates</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Guests</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount (IDR)</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                      <p className="text-sm text-gray-500">Memuat data...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <tr key={booking.id_booking} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 font-medium block">#{booking.id_booking}</span>
                      <span className="text-xs text-gray-500">{booking.invoice}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{booking.user_name}</p>
                        <p className="text-xs text-gray-500">{booking.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{booking.unit_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <span className="block">{booking.check_in}</span>
                      <span className="block text-gray-400 text-xs">to</span>
                      <span className="block">{booking.check_out}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{booking.jumlah_orang}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(booking.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium block text-center mb-1 ${getStatusColor(booking.status_booking)}`}>
                        {booking.status_booking}
                      </span>
                      <span className="text-[10px] text-gray-500 block text-center uppercase tracking-wide">
                        Pay: {booking.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => deleteBooking(booking.id_booking)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors" 
                          title="Delete">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-12 h-12 text-gray-300" />
                      <p className="text-gray-500 font-medium">No bookings found</p>
                      <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
