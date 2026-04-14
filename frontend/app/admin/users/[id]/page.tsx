import AdminLayout from '@/components/AdminLayout';
import UserView from '@/components/UserView';

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

const DUMMY_USERS: User[] = [
  { id: 1, name: 'John Doe', email: 'john.doe@email.com', phone: '+1 234-567-8901', role: 'user', status: 'active', joinedDate: '2024-01-15', totalBookings: 5, totalSpent: '$6,200', bio: 'Traveler and photographer.' },
  { id: 2, name: 'Jane Smith', email: 'jane.smith@email.com', phone: '+1 234-567-8902', role: 'user', status: 'active', joinedDate: '2024-03-20', totalBookings: 3, totalSpent: '$4,500', bio: 'Food lover.' },
  { id: 3, name: 'Mike Johnson', email: 'mike.j@email.com', phone: '+1 234-567-8903', role: 'user', status: 'active', joinedDate: '2024-06-10', totalBookings: 8, totalSpent: '$12,300', bio: 'Hiker.' }
];

export default async function UserPage({ params }: { params: { id: string } }) {
  const id = params.id;

  // Try fetch from API (server-side). If it fails, fall back to dummy data.
  let user: User | null = null;
  try {
    const res = await fetch(`/api/users/${id}`, { cache: 'no-store' });
    if (res && res.ok) {
      user = await res.json();
    }
  } catch (err) {
    user = null;
  }

  // Fallback to dummy user when not found from API
  if (!user) {
    const idNum = parseInt(id, 10);
    user = DUMMY_USERS.find(u => u.id === idNum) || null;
  }

  return (
    <AdminLayout title="View User">
      <div className="max-w-4xl mx-auto w-full">
        {user ? (
          <>
            <div className="bg-white rounded-lg shadow-lg p-8 w-full mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">User Detail</h1>
              <p className="text-gray-600 mb-4">Detail informasi user dan aktivitas</p>
              <UserView user={user} />
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8 w-full">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">User tidak ditemukan</h1>
            <p className="text-gray-600">Data user untuk ID {id} tidak tersedia.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
