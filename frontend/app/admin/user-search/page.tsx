'use client';

import AdminDashboard from '@/components/AdminDashboard';
import { useEffect } from 'react';

export default function UserSearchPage() {
  useEffect(() => {
    // Ambil token dari URL jika ada
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    
    if (token) {
      // Simpan token di localStorage Next.js (port 3000)
      localStorage.setItem('token', token);
      
      // (Opsional) Hapus token dari URL agar lebih rapi
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return <AdminDashboard defaultMenu="users" />;
}
