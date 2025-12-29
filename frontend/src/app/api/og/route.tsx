import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'preview';

  if (type === 'icon') {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #3B82F6, #06B6D4)',
            borderRadius: '25%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'white',
              borderRadius: '20%',
              width: '70%',
              height: '50%',
            }}
          >
            <span style={{ fontSize: 120 }}>💳</span>
          </div>
        </div>
      ),
      { width: 512, height: 512 }
    );
  }

  if (type === 'splash') {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#1e3a8a',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'white',
              borderRadius: 30,
              width: 200,
              height: 150,
              marginBottom: 30,
            }}
          >
            <span style={{ fontSize: 80 }}>💳</span>
          </div>
          <div style={{ fontSize: 48, fontWeight: 'bold', color: 'white' }}>
            CrossPay
          </div>
          <div style={{ fontSize: 20, color: '#93C5FD', marginTop: 10 }}>
            Instant Crypto Payments
          </div>
        </div>
      ),
      { width: 512, height: 512 }
    );
  }

  // Default: preview/image
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a, #1e3a8a, #0f172a)',
          padding: 60,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 30 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'white',
              borderRadius: 20,
              width: 100,
              height: 100,
              marginRight: 30,
            }}
          >
            <span style={{ fontSize: 50 }}>💳</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 64, fontWeight: 'bold', color: 'white' }}>
              CrossPay
            </div>
            <div style={{ fontSize: 24, color: '#93C5FD' }}>
              Instant Crypto Payments on Base
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 40, marginTop: 30 }}>
          <div style={{ fontSize: 22, color: 'white' }}>⚡ Instant</div>
          <div style={{ fontSize: 22, color: 'white' }}>📱 QR Codes</div>
          <div style={{ fontSize: 22, color: 'white' }}>💰 1% Fee</div>
        </div>
        <div
          style={{
            marginTop: 40,
            background: '#06B6D4',
            padding: '12px 24px',
            borderRadius: 20,
            fontSize: 18,
            fontWeight: 'bold',
            color: 'white',
          }}
        >
          Built on Base
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

