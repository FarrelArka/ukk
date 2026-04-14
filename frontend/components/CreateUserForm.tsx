'use client';

import { useState } from 'react';
import { Mail, Phone, User, AlertCircle, Lock, Shield, CheckCircle } from 'lucide-react';

type UserRole = 'admin' | 'user' | 'guest';

interface FormData {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: 'active' | 'inactive';
  password: string;
  confirmPassword: string;
}

export default function CreateUserForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    role: 'user',
    status: 'active',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) { 
      setError('Nama harus diisi'); 
      return false; 
    }
    if (!formData.email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) { 
      setError('Email tidak valid'); 
      return false; 
    }
    if (!formData.phone.trim()) { 
      setError('No. telepon harus diisi'); 
      return false; 
    }
    if (!formData.password) { 
      setError('Password harus diisi'); 
      return false; 
    }
    if (formData.password.length < 6) { 
      setError('Password minimal 6 karakter'); 
      return false; 
    }
    if (formData.password !== formData.confirmPassword) { 
      setError('Password tidak sama'); 
      return false; 
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Gagal membuat user');

      setSuccess('User berhasil dibuat!');
      setFormData({ 
        name: '', 
        email: '', 
        phone: '', 
        role: 'user', 
        status: 'active', 
        password: '', 
        confirmPassword: '' 
      });

      setTimeout(() => {
        setSuccess('');
        window.location.href = '/admin';
      }, 1400);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Buat User Baru</h1>
        <p className="text-gray-600">Tambahkan pengguna baru ke sistem</p>
      </div>

      <div className="space-y-8">
        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Error</p>
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="flex items-start gap-3 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg shadow-sm">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900">Berhasil!</p>
              <p className="text-green-800 text-sm">{success}</p>
            </div>
          </div>
        )}

        {/* Informasi Pribadi Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-black mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Informasi Pribadi
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nama */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-black mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-400 shadow-sm"
                placeholder="Contoh: John Doe"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-black mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-400 shadow-sm"
                placeholder="user@example.com"
              />
            </div>

            {/* Telepon */}
            <div>
              <label className="block text-sm font-bold text-black mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Nomor Telepon <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-400 shadow-sm"
                placeholder="+62 812 3456 7890"
              />
            </div>
          </div>
        </div>

        {/* Role & Status Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-black mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Role & Status
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Role */}
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black shadow-sm"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="guest">Guest</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Tentukan hak akses pengguna</p>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black shadow-sm"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Status akun pengguna</p>
            </div>
          </div>
        </div>

        {/* Keamanan Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-black mb-6 flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-600" />
            Keamanan
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-black mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-400 shadow-sm"
                placeholder="Minimum 6 karakter"
              />
              <p className="text-xs text-gray-500 mt-1">Gunakan kombinasi huruf, angka, dan simbol</p>
            </div>

            {/* Konfirmasi Password */}
            <div>
              <label className="block text-sm font-bold text-black mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Konfirmasi Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-400 shadow-sm"
                placeholder="Ketik ulang password"
              />
              <p className="text-xs text-gray-500 mt-1">Pastikan password sama</p>
            </div>
          </div>

          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs font-semibold text-black mb-2">Kekuatan Password:</p>
              <div className="flex gap-1">
                <div className={`h-1 flex-1 rounded ${formData.password.length >= 6 ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
                <div className={`h-1 flex-1 rounded ${formData.password.length >= 8 ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
                <div className={`h-1 flex-1 rounded ${formData.password.length >= 10 && /[A-Z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <div className={`h-1 flex-1 rounded ${formData.password.length >= 12 && /[A-Z]/.test(formData.password) && /[0-9]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {formData.password.length < 6 && 'Lemah - Minimal 6 karakter'}
                {formData.password.length >= 6 && formData.password.length < 8 && 'Sedang - Tambah panjang password'}
                {formData.password.length >= 8 && formData.password.length < 10 && 'Baik - Tambah huruf besar'}
                {formData.password.length >= 10 && /[A-Z]/.test(formData.password) && 'Kuat - Password aman'}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-40 py-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-gray-800 transition-all shadow-md hover:shadow-lg"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Memproses...
              </>
            ) : (
              <>
                <User className="w-5 h-5 " />
                Buat User
              </>
            )}
          </button>
          <button
            onClick={() => window.location.href = '/admin'}
            className="flex-1 px-6 py-4 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-lg transition-colors shadow-md hover:shadow-lg text-lg"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}