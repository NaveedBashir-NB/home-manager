import "./globals.css";
import Navbar from "./components/Navbar";
import Providers from "./providers";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "Home Manager",
  description: "Grocery & Household Management App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&family=Playfair+Display:wght@600;700&display=swap"
          rel="stylesheet"
        />
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
                  duration: 5000,
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
