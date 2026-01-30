"use client";

import { useEffect, useRef, useState } from "react";
import { AdPlacement } from "@/types";

interface AdBannerProps {
  placement: AdPlacement;
  className?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export function AdBanner({ placement, className = "" }: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [slotConfig, setSlotConfig] = useState<{
    slotId: string;
    format: string;
  } | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetch(`${API_URL}/settings?key=adsense_client_id`).then((r) => r.json()),
      fetch(`${API_URL}/ad-slots?placement=${placement}`).then((r) => r.json()),
    ])
      .then(([settingsData, slotData]) => {
        if (cancelled) return;
        const id = settingsData.setting?.value || "";
        if (id && id !== "ca-pub-XXXXXXXXXX") {
          setClientId(id);
        }
        if (slotData.slot) {
          setSlotConfig({
            slotId: slotData.slot.slotId,
            format: slotData.slot.format,
          });
        }
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [placement]);

  useEffect(() => {
    if (!clientId || !slotConfig) return;
    try {
      // @ts-expect-error adsbygoogle is a global
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense not loaded
    }
  }, [clientId, slotConfig]);

  if (!loaded) return null;
  if (!clientId || !slotConfig) return null;

  const getAdStyle = (): React.CSSProperties => {
    switch (slotConfig.format) {
      case "horizontal":
        return { display: "block" };
      case "rectangle":
        return { display: "inline-block", width: 336, height: 280 };
      case "square":
        return { display: "inline-block", width: 300, height: 250 };
      default:
        return { display: "block" };
    }
  };

  const getAdFormat = () => {
    switch (slotConfig.format) {
      case "horizontal":
        return "auto";
      case "rectangle":
      case "square":
        return "rectangle";
      default:
        return "auto";
    }
  };

  return (
    <div ref={adRef} className={className}>
      <ins
        className="adsbygoogle"
        style={getAdStyle()}
        data-ad-client={clientId}
        data-ad-slot={slotConfig.slotId}
        data-ad-format={getAdFormat()}
        {...(slotConfig.format === "horizontal"
          ? { "data-full-width-responsive": "true" }
          : {})}
      />
    </div>
  );
}
