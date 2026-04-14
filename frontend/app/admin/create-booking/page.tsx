'use client';

import AdminLayout from '@/components/AdminLayout';
import CreateBookingForm from '@/components/CreateBookingForm';

export default function CreateBookingPage() {
  return (
    <AdminLayout title="Buat Booking Baru">
      <div className="max-w-6xl mx-auto w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Buat Booking Baru</h1>
          <p className="text-gray-600 mb-8">Tambahkan booking baru ke sistem</p>
          <CreateBookingForm />
        </div>
      </div>
    </AdminLayout>
  );
}