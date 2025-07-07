import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const decodedToken: any = jwt.verify(token, process.env.JWT_SECRET!);

    const user = await User.findById(decodedToken.id).select('-passwordHash');

    if (!user) {
        const response = NextResponse.json({ message: 'User not found' }, { status: 404 });
        response.cookies.set('token', '', { httpOnly: true, expires: new Date(0), path: '/' });
        return response;
    }
     if (user.isBlocked) {
        const response = NextResponse.json({ message: 'This account has been blocked.' }, { status: 403 });
        response.cookies.set('token', '', { httpOnly: true, expires: new Date(0), path: '/' });
        return response;
    }

    return NextResponse.json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto,
    });

  } catch (error) {
    console.error('Me error:', error);
    const response = NextResponse.json({ message: 'Authentication failed' }, { status: 401 });
    response.cookies.set('token', '', { httpOnly: true, expires: new Date(0), path: '/' });
    return response;
  }
}
