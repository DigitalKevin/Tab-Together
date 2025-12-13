import './globals.css';

export const metadata = {
  title: 'FairShare',
  description: 'The Easiest Way to Even the Score',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="topbar">
          <div className="container">
            <img src="/assets/FairShareLogo.png" alt="FairShare logo" onError="this.style.display='none'" />
            <div className="title-block">
              <div className="brand">Fair Share</div>
              <div className="slogan">The Easiest Way to Even the Score</div>
            </div>
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}
