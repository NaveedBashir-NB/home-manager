import "./globals.css";
import Navbar from "./components/Navbar";
import Providers from "./providers";
import { ThemeProvider } from "next-themes";

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
            <main className="pt-20">{children}</main>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
