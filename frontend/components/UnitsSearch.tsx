'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Search, Plus, Trash2, Filter, MapPin, Loader2, AlertCircle, Edit2
} from 'lucide-react';
import SearchBar from './SearchBar';

interface Unit {
  unit_id: number;
  name: string;
  category: string;
  status_unit: string;
  price: number;
  jumlah_kamar: number;
  alamat: string;
  images: string[];
  fasilitas: string[];
  capacity: number;
}

const API_BASE = 'http://localhost:5050/api/admin/accommodations';

function getToken(): string {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams(window.location.search);
  const urlToken = params.get('token');
  if (urlToken) return urlToken;
  return localStorage.getItem('token') ?? '';
}

export default function UnitsSearch() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [unitSearch, setUnitSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUnits = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(API_BASE, {
        method: 'GET',
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Gagal mengambil data units');
      }
      const data: Unit[] = await res.json();
      setUnits(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const deleteUnit = async (id: number) => {
    if (!confirm('Hapus unit ini?')) return;
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Gagal menghapus unit');
      }
      setUnits(prev => prev.filter(u => u.unit_id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menghapus unit');
    }
  };

  const filteredUnits = useMemo(() => {
    return units.filter(unit => {
      return (
        unit.name?.toLowerCase().includes(unitSearch.toLowerCase()) ||
        unit.category?.toLowerCase().includes(unitSearch.toLowerCase()) ||
        unit.alamat?.toLowerCase().includes(unitSearch.toLowerCase())
      );
    });
  }, [unitSearch, units]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available': return 'bg-green-100 text-green-700';
      case 'booked': return 'bg-blue-100 text-blue-700';
      case 'maintenance': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Units Management</h2>
          <p className="text-sm text-gray-600 mt-1">Manage all your rental units</p>
        </div>
        <Link href="/admin/create-unit" className="bg-gray-900 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-gray-800 transition-all shadow-md hover:shadow-lg">
          <Plus className="w-4 h-4" />
          Add New Unit
        </Link>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <SearchBar
          value={unitSearch}
          onChange={setUnitSearch}
          placeholder="Search units by name, category, or location..."
        />
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
          <button
            onClick={fetchUnits}
            className="ml-auto text-sm underline hover:no-underline"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* Results Count */}
      {unitSearch && (
        <div className="flex items-center gap-2 text-sm">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-gray-600">
            Found <span className="font-semibold text-gray-900">{filteredUnits.length}</span> result{filteredUnits.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price (IDR)</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rooms</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Capacity</th>
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
              ) : filteredUnits.length > 0 ? (
                filteredUnits.map((unit) => (
                  <tr key={unit.unit_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{unit.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{unit.category}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {unit.alamat}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(unit.price)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{unit.jumlah_kamar}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{unit.capacity} Users</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(unit.status_unit)}`}>
                        {unit.status_unit}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link 
                          href={`/admin/edit-unit/${unit.unit_id}`}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors" 
                          title="Edit">
                          <Edit2 className="w-4 h-4 text-blue-600" />
                        </Link>
                        <button 
                          onClick={() => deleteUnit(unit.unit_id)}
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
                      <p className="text-gray-500 font-medium">No units found</p>
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
