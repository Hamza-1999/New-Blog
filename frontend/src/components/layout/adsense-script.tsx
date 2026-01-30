"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export function AdSenseScript() {
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/settings?key=adsense_client_id`)
      .then((res) => res.json())
      .then((data) => {
        const id = data.setting?.value || "";
        if (id && id !== "ca-pub-XXXXXXXXXX") {
          setClientId(id);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!clientId) return;
    if (document.querySelector(`script[data-adsense-id="${clientId}"]`)) return;

    const script = document.createElement("script");
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("data-adsense-id", clientId);
    document.head.appendChild(script);
  }, [clientId]);

  return null;
}
