import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { NotificationProvider } from "@/components/notifications/notification-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project Manager",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="font-sans antialiased"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <NotificationProvider>{children}</NotificationProvider>
        <Analytics />
      </body>
    </html>
  );
}
