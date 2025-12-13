import './globals.css';

export const metadata = {
  title: 'FairShare',
  description: 'Split expenses with friends',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
