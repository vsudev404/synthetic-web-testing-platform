import './globals.css';

export const metadata = {
  title: 'Synthetic Web Testing Platform',
  description: 'Synthetic browser sessions for controlled testing.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
