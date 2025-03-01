import React, { useState } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  sidebarContent?: React.ReactNode;
  className?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  showSidebar = false,
  sidebarContent,
  className = '',
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="flex flex-1">
        {showSidebar && (
          <>
            {/* Sidebar for medium and large screens */}
            <div className="hidden md:block">
              {sidebarContent}
            </div>

            {/* Mobile sidebar */}
            <div className="md:hidden">
              {isSidebarOpen && (
                <div
                  className="fixed inset-0 z-10 bg-black bg-opacity-50 transition-opacity"
                  onClick={() => setIsSidebarOpen(false)}
                ></div>
              )}

              <div
                className={`fixed inset-y-0 left-0 z-20 w-64 transition-transform transform ${
                  isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
              >
                {sidebarContent}
              </div>
            </div>
          </>
        )}

        {/* Main content */}
        <main className={`flex-1 ${className}`}>
          {showSidebar && (
            <button
              className="md:hidden fixed bottom-4 right-4 z-20 p-2 bg-primary-600 text-white rounded-full shadow-lg"
              onClick={toggleSidebar}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isSidebarOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          )}

          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
};