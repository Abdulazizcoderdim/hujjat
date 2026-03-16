"use client";

import Script from "next/script";

export default function ClickScript() {
  return (
    <Script
      src="https://my.click.uz/pay/checkout.js"
      strategy="afterInteractive"
      onLoad={() => {
        console.log("Click to'lov tizimi yuklandi");
      }}
    />
  );
}
