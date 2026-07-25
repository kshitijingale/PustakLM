import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PustakLM — Your library. Now conversational.",
  description: "An AI research assistant that answers from your own sources, with citations.",
};

// Dark mode is the primary experience. We read a saved preference before
// paint via an inline script to avoid a light-mode flash on load.
const themeScript = `
(function() {
  try {
    var saved = localStorage.getItem('pustaklm-theme');
    var theme = saved || 'dark';
    document.documentElement.classList.add(theme);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
