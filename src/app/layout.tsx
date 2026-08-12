import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["400", "600", "700"],
});

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
    <html lang="en" className={`${inter.variable} ${sourceSerif.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans">
        {/* Subtle paper grain overlay */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0 opacity-[0.02]"
          style={{ backgroundImage: "url(/noise.svg)" }}
        />
        {/* Ambient gradient glows */}
        <div
          aria-hidden
          className="pointer-events-none fixed -top-40 -left-40 z-0 h-96 w-96 rounded-full bg-accent/5 blur-[80px] will-change-transform"
        />
        <div
          aria-hidden
          className="pointer-events-none fixed -bottom-40 -right-40 z-0 h-96 w-96 rounded-full bg-accent/3 blur-[80px] will-change-transform"
        />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
