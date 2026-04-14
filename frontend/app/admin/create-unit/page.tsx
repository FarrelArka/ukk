'use client';

import AdminLayout from '@/components/AdminLayout';
import CreateUnitForm from '@/components/CreateUnitForm';

export default function CreateUnitPage() {
  return (
    <AdminLayout title="Buat Unit Baru">
      <div className="max-w-6xl mx-auto w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Buat Unit Baru</h1>
          <p className="text-gray-600 mb-8">Tambahkan informasi lengkap untuk unit properti baru Anda</p>
          <CreateUnitForm />
        </div>
      </div>
    </AdminLayout>
  );
}
