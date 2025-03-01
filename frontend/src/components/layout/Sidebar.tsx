import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarItem {
  title: string;
  path: string;
  icon: React.ReactNode;
}

interface SidebarCategory {
  title: string;
  items: SidebarItem[];
}

interface SidebarProps {
  categories: SidebarCategory[];
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  categories,
  isOpen = true,
  onClose,
  className = '',
}) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-20 flex flex-col w-64 h-full bg-white border-r border-gray-200 transition-transform duration-300 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:relative md:translate-x-0 ${className}`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <img src="/logo.svg" alt="Logo" className="h-8 w-auto" />
          <h2 className="text-xl font-bold text-primary-600">CodeAgent</h2>
        </div>
        <button
          onClick={onClose}
          className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="flex-1 px-4 py-6 overflow-y-auto">
        {categories.map((category, index) => (
          <div key={index} className="mb-8">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {category.title}
            </h3>
            <div className="mt-3 space-y-1">
              {category.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    isActive(item.path)
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className={`mr-3 h-5 w-5 ${isActive(item.path) ? 'text-primary-500' : 'text-gray-500'}`}>
                    {item.icon}
                  </span>
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};