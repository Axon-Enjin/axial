import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0B0E14",
          gap: 28,
        }}
      >
        {/* Mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 112,
            height: 112,
            background: "#111827",
            borderRadius: 22,
            border: "1px solid rgba(190,198,224,0.15)",
          }}
        >
          <svg width="68" height="68" viewBox="0 0 32 32" fill="none">
            <path
              d="M8 24L14.4 9"
              stroke="#DDE3EB"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M24 24L17.6 9"
              stroke="#DDE3EB"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M10.8 17.5L21.2 17.5"
              stroke="#2DD4BF"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Wordmark */}
        <div
          style={{
            fontSize: 88,
            fontWeight: 700,
            color: "#DDE3EB",
            letterSpacing: "-3px",
            lineHeight: 1,
          }}
        >
          Axial
        </div>

        {/* Teal rule */}
        <div
          style={{
            width: 56,
            height: 3,
            background: "#2DD4BF",
            borderRadius: 2,
          }}
        />

        {/* Tagline */}
        <div
          style={{
            fontSize: 30,
            color: "#8A92A3",
            letterSpacing: "0px",
          }}
        >
          Instant Capital, Invisible Compliance.
        </div>

        {/* Sub-line */}
        <div
          style={{
            fontSize: 20,
            color: "#4B5563",
            marginTop: 4,
          }}
        >
          Liquidity and compliance engine for Philippine MSMEs · Powered by Stellar
        </div>
      </div>
    ),
    { ...size }
  );
}
