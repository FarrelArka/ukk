'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Loader2, AlertCircle, Eye, Star } from 'lucide-react';
import SearchBar from './SearchBar';

type TestimonialStatus = 'approved' | 'pending' | 'rejected' | 'active'; // 'active' map to 'approved' based on context potentially

interface Testimonial {
  id: number;
  user_name: string;
  unit_name: string;
  rating: number;
  comment: string;
  created_at: string;
  status: TestimonialStatus;
}

const API_BASE = 'http://localhost:5050/api/admin/testimonials';

function getToken(): string {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams(window.location.search);
  const urlToken = params.get('token');
  if (urlToken) return urlToken;
  return localStorage.getItem('token') ?? '';
}

export default function TestimonialsSearch() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTestimonials = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(API_BASE, {
        method: 'GET',
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error('Gagal mengambil data testimonials');
      }
      const data = await res.json();
      setTestimonials(data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);



  const filteredTestimonials = useMemo(() => {
    let filtered = testimonials.filter(t => {
      const searchLower = searchQuery.toLowerCase();
      // Protect string match gracefully logic
      const uName = t.user_name || '';
      const unitN = t.unit_name || '';
      const comm = t.comment || '';
      return (
        uName.toLowerCase().includes(searchLower) ||
        unitN.toLowerCase().includes(searchLower) ||
        comm.toLowerCase().includes(searchLower)
      );
    });

    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    return filtered;
  }, [searchQuery, statusFilter, testimonials]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  if (loading && testimonials.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 h-64">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Memuat Testimonials...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Testimonials Management</h2>
          <p className="text-sm text-gray-600 mt-1">Review and manage guest feedback</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by user, unit, or comment..."
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white shadow-sm hover:shadow-md transition-all min-w-[160px]"
        >
          <option value="all">All Status</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
          <option value="active">Active</option>
        </select>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
          <button
            onClick={fetchTestimonials}
            className="ml-auto text-sm underline hover:no-underline"
          >
            Coba lagi
          </button>
        </div>
      )}

      {(searchQuery || statusFilter !== 'all') && (
        <div className="flex items-center gap-2 text-sm">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-gray-600">
            Found <span className="font-semibold text-gray-900">{filteredTestimonials.length}</span> result{filteredTestimonials.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredTestimonials.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filteredTestimonials.map((testimonial) => (
              <div key={testimonial.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-gray-700 font-semibold text-lg shadow-sm uppercase">
                      {testimonial.user_name ? testimonial.user_name.charAt(0) : '?'}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">{testimonial.user_name || 'Anonymous'}</h4>
                      <p className="text-sm text-gray-600 font-medium">{testimonial.unit_name || 'No Unit'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(testimonial.rating)}
                        <span className="text-xs text-gray-500">{new Date(testimonial.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${getStatusColor(testimonial.status)}`}>
                    {testimonial.status}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-4 pl-16 leading-relaxed italic border-l-2 border-gray-100 py-1 ml-4 block whitespace-pre-wrap">{testimonial.comment}</p>
                
                <div className="flex gap-2 pl-16">
                  <div className="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg text-xs font-medium flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    View Only
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center flex flex-col items-center">
            <Search className="w-12 h-12 text-gray-300 mb-2" />
            <p className="text-gray-500 font-medium">No testimonials found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
