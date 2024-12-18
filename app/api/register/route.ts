import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

export async function POST(request: Request) {
  try {
    const { username, password, email, phonenumber, profilePicture } = await request.json();
    const client = await clientPromise;
    const db = client.db("employeeManagement");
    const existingUser = await db.collection("profiles").findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }
    const newUser = {
      username,
      password,
      email,
      phonenumber,
      profilePicture,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await db.collection("profiles").insertOne(newUser);

    if (result.acknowledged) {
      return NextResponse.json({ message: 'User registered successfully', userId: result.insertedId }, { status: 201 });
    } else {
      throw new Error('Failed to insert user into database');
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}