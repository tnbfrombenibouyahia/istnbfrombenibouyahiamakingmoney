import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#050a05',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          border: '1px solid rgba(74, 222, 128, 0.5)',
        }}
      >
        <span
          style={{
            color: '#4ade80',
            fontSize: 15,
            fontWeight: 'bold',
            fontFamily: 'monospace',
            letterSpacing: '-1px',
          }}
        >
          &gt;_
        </span>
      </div>
    ),
    { ...size }
  );
}
