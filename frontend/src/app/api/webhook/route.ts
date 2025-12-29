import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    app: 'CrossPay',
    version: '2.0',
    webhook: 'active' 
  });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Webhook received:', data);
    
    // Handle Farcaster webhook events
    return NextResponse.json({ 
      status: 'received',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

