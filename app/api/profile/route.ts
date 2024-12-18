import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

function isValidObjectId(id: string): boolean {
  return ObjectId.isValid(id) && (new ObjectId(id)).toString() === id;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || !isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid Profile ID' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("employeeManagement");

    const profile = await db.collection("profiles").findOne({ _id: new ObjectId(id) });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const updates = await request.json();

    if (!id || !isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid Profile ID' }, { status: 400 });
    }

    // Validate the updates object
    if (!updates || typeof updates !== 'object' || Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Invalid update data' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("employeeManagement");

    // Only update allowed fields
    const allowedFields = ['username', 'email', 'phonenumber'];
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .reduce<Record<string, any>>((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    const result = await db.collection("profiles").updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...filteredUpdates, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (result.modifiedCount === 0) {
      return NextResponse.json({ message: 'No changes were made to the profile' });
    }

    return NextResponse.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || !isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid Profile ID' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("employeeManagement");

    const result = await db.collection("profiles").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile:', error);
    return NextResponse.json({ error: 'Failed to delete profile' }, { status: 500 });
  }
}