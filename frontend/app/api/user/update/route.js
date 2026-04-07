import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { updateUser } from '@/lib/userStore';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json(
        { message: 'You must be logged in to update your profile' },
        { status: 401 }
      );
    }

    const { name, email, phone, address } = await request.json();

    // In this dummy setup, we identify the user by email from the session
    // and updatedData contains name, phone, address etc.
    // Note: session.user.email is our unique identifier here.
    
    // First find the user's ID
    const usersFile = path.join(process.cwd(), 'data', 'users.json');
    const users = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
    const user = users.find(u => u.email === session.user.email);

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    const updatedUser = updateUser(user.id, { name, email, phone, address });

    return NextResponse.json(
      { message: 'Profile updated successfully', user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
