import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StreamPay — Real-Time Streaming Payments on Monad",
  description:
    "Experience real-time per-second streaming payments powered by Monad's 10,000 TPS blockchain. Pay only for what you watch.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#141414] text-white overflow-hidden">
        {children}
      </body>
    </html>
  );
}
