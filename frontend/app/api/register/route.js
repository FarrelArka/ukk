import { NextResponse } from 'next/server';
import { addUser, findUserByEmail } from '@/lib/userStore';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const existingUser = findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      );
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password, // Note: In a real app, always hash the password!
    };

    addUser(newUser);

    return NextResponse.json(
      { message: 'User registered successfully', user: { id: newUser.id, name: newUser.name, email: newUser.email } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
