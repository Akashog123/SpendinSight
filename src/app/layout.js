import "./globals.css";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import AppNavigationMenu from '@/components/NavigationMenu';

export const metadata = {
  title: "SpendinSight",
  description: "A simple budgeting app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ErrorBoundary>
          <header className="container mx-auto p-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="flex ml-4 items-center gap-3 text-left">
              <img src="/icon.jpg" alt="Icon" className="w-10 h-10 rounded-full" />
              <span className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent relative">
                SpendinSight
                <span className="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent bg-clip-text text-transparent"></span>
              </span>
            </div>
            <div className="w-full flex justify-end">
              <AppNavigationMenu />
            </div>
          </header>
          <main className="container mx-auto px-4">
            {children}
          </main>
        </ErrorBoundary>
      </body>
    </html>
  );
}
