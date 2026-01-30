import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'PNGX Secure Vault';
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
                    background: 'linear-gradient(to bottom right, #000000, #1a1a1a)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif',
                    color: 'white',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '20px',
                    }}
                >
                    {/* Logo Icon Mockup */}
                    <div
                        style={{
                            width: '80px',
                            height: '80px',
                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '20px',
                            boxShadow: '0 0 40px rgba(59, 130, 246, 0.5)',
                        }}
                    >
                        <svg
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                        </svg>
                    </div>
                    <div style={{ fontSize: '80px', fontWeight: 'bold', letterSpacing: '-2px' }}>PNGX</div>
                </div>
                <div
                    style={{
                        fontSize: '32px',
                        background: 'linear-gradient(to right, #9ca3af, #6b7280)',
                        backgroundClip: 'text',
                        color: 'transparent',
                        marginTop: '10px',
                    }}
                >
                    Secure Steganography Vault
                </div>
                <div
                    style={{
                        position: 'absolute',
                        bottom: '40px',
                        display: 'flex',
                        gap: '20px',
                        fontSize: '20px',
                        color: '#4b5563'
                    }}
                >
                    <span>AES-256</span>
                    <span>•</span>
                    <span>Zero Knowledge</span>
                    <span>•</span>
                    <span>Blockchain Verified</span>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
