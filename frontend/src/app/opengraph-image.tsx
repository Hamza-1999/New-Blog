import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Flavor Journal - Stories, Ideas & Insights";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <span
            style={{
              fontSize: "72px",
              fontWeight: 800,
              color: "#faf8f5",
              letterSpacing: "-2px",
            }}
          >
            Flavor
          </span>
          <span
            style={{
              fontSize: "72px",
              fontWeight: 800,
              color: "#e07a5f",
              letterSpacing: "-2px",
            }}
          >
            Journal
          </span>
        </div>
        <div
          style={{
            fontSize: "28px",
            color: "#a0a0a0",
            textAlign: "center",
            maxWidth: "700px",
            lineHeight: 1.4,
          }}
        >
          Stories, Ideas & Insights
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            fontSize: "16px",
            color: "#666",
          }}
        >
          flavorjournal.com
        </div>
      </div>
    ),
    { ...size }
  );
}
