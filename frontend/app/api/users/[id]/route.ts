import { NextResponse } from 'next/server';

const users = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+1 234-567-8901',
    role: 'user',
    status: 'active',
    joinedDate: '2024-01-15',
    totalBookings: 5,
    totalSpent: '$6,200',
    bio: 'Traveler and photographer. Loves beach houses.'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@email.com',
    phone: '+1 234-567-8902',
    role: 'user',
    status: 'active',
    joinedDate: '2024-03-20',
    totalBookings: 3,
    totalSpent: '$4,500',
    bio: 'Food lover and adventurer.'
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike.j@email.com',
    phone: '+1 234-567-8903',
    role: 'user',
    status: 'active',
    joinedDate: '2024-06-10',
    totalBookings: 8,
    totalSpent: '$12,300',
    bio: 'Hiker and nature enthusiast.'
  },
  {
    id: 4,
    name: 'Sarah Williams',
    email: 'sarah.w@email.com',
    phone: '+1 234-567-8904',
    role: 'admin',
    status: 'active',
    joinedDate: '2023-11-05',
    totalBookings: 2,
    totalSpent: '$2,100',
    bio: 'Admin of the system.'
  },
  {
    id: 5,
    name: 'Robert Brown',
    email: 'robert.b@email.com',
    phone: '+1 234-567-8905',
    role: 'user',
    status: 'inactive',
    joinedDate: '2024-08-22',
    totalBookings: 1,
    totalSpent: '$800',
    bio: 'Occasional traveler.'
  }
];

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = parseInt(id, 10);
  const user = users.find(u => u.id === userId);
  if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // This is a mock; in a real app you'd update DB.
  const { id } = await params;
  const userId = parseInt(id, 10);
  const body = await request.json().catch(() => ({}));
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) return NextResponse.json({ message: 'User not found' }, { status: 404 });

  const updated = { ...users[userIndex], ...body };
  users[userIndex] = updated;
  return NextResponse.json(updated);
}
