import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "Test Portal",
  description: "A test portal",
};

const opensans = Open_Sans({
  display: "fallback",
  subsets: ["latin"]
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${opensans.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
