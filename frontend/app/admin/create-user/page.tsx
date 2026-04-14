'use client';

import AdminLayout from '@/components/AdminLayout';
import CreateUserForm from '@/components/CreateUserForm';

export default function CreateUserPage() {
  return (
    <AdminLayout title="Buat User Baru">
      <div className="max-w-6xl mx-auto w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Buat User Baru</h1>
          <p className="text-gray-600 mb-8">Tambahkan user baru ke sistem</p>
          <CreateUserForm />
        </div>
      </div>
    </AdminLayout>
  );
}
