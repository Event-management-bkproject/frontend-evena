

export const metadata = {
  title: "Event Ticket System",
  description: "Login and Dashboard demo",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
