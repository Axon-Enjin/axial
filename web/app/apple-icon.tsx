import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0B0E14",
          borderRadius: 40,
        }}
      >
        <svg width="110" height="110" viewBox="0 0 32 32" fill="none">
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
    ),
    { ...size }
  );
}
