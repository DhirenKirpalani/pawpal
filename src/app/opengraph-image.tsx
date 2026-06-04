import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'PawPal.ID - AI Pet Health Assistant on WhatsApp';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 50%, #fae8ff 100%)',
          position: 'relative',
        }}
      >
        {/* Decorative blobs */}
        <div
          style={{
            position: 'absolute',
            top: -50,
            left: -50,
            width: 300,
            height: 300,
            background: '#c084fc',
            borderRadius: '50%',
            opacity: 0.3,
            filter: 'blur(60px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -50,
            right: -50,
            width: 300,
            height: 300,
            background: '#e879f9',
            borderRadius: '50%',
            opacity: 0.3,
            filter: 'blur(60px)',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '60px',
          }}
        >
          <div style={{ fontSize: 120, marginBottom: 20 }}>🐾</div>
          
          <h1
            style={{
              fontSize: 80,
              fontWeight: 900,
              background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #d946ef 100%)',
              backgroundClip: 'text',
              color: 'transparent',
              margin: 0,
              marginBottom: 20,
            }}
          >
            PawPal.ID
          </h1>
          
          <p
            style={{
              fontSize: 40,
              color: '#1f2937',
              margin: 0,
              marginBottom: 15,
              fontWeight: 600,
            }}
          >
            AI Pet Health Assistant
          </p>
          
          <p
            style={{
              fontSize: 28,
              color: '#6b7280',
              margin: 0,
              marginBottom: 30,
              maxWidth: 800,
            }}
          >
            Get instant guidance for your pet's health, behavior, and nutrition — in WhatsApp
          </p>
          
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 15,
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              padding: '20px 40px',
              borderRadius: 50,
              color: 'white',
              fontSize: 32,
              fontWeight: 700,
            }}
          >
            <span style={{ fontSize: 40 }}>💬</span>
            <span>Chat on WhatsApp</span>
          </div>
          
          <p
            style={{
              fontSize: 24,
              color: '#8b5cf6',
              margin: 0,
              marginTop: 20,
              fontWeight: 600,
            }}
          >
            🌏 English & Indonesian
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
