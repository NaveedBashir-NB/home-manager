import "./globals.css";
import Navbar from "./components/Navbar";
import Providers from "./providers";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "Home Manager",
  description: "Grocery & Household Management App",
  manifest: "/manifest.json", // This links the manifest
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Home Manager",
  },
  formatDetection: {
    telephone: false,
  },
};


export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#dab500" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&family=Playfair+Display:wght@600;700&display=swap"
          rel="stylesheet"
        />

        {/* Browser Favicons */}
        <link
          rel="icon"
          type="image/png"
          sizes="96x96"
          href="/favicon-96x96.png"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* Apple Touch Icon */}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <meta name="apple-mobile-web-app-title" content="Home Manager" />

        {/* Web App Manifest */}
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          <Providers>
            <Navbar />
            <main className="pt-20">
              {children}

              {/* Global toaster */}
              <Toaster
                position="bottom-right"
                reverseOrder={false}
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: "var(--color-accent-light)",
                    color: "var(--color-secondary)",
                    border: "1px solid var(--color-primary)",
                    fontSize: "14px",
                  },
                }}
              />
            </main>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
