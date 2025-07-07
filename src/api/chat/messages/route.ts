
import { NextResponse, type NextRequest } from 'next/server';

// This route file is intentionally left without a POST handler.
// Message creation is now handled by the real-time WebSocket server
// located at /pages/api/socket.ts to ensure instant delivery.

// You can add other handlers here if needed for other message-related operations.
export async function GET(request: NextRequest) {
    return NextResponse.json({ message: "This endpoint is for real-time services. Use the WebSocket connection." }, { status: 405 });
}
