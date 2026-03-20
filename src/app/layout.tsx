import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Task Manager",
  description: "Manage your tasks efficiently",
};

const themeInitScript = `
(function() {
  try {
    var t = localStorage.getItem('theme');
    if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  } catch(e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen">
        <ThemeProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "var(--toast-bg)",
                color: "var(--toast-color)",
                border: "1px solid var(--toast-border)",
              },
            }}
          />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
