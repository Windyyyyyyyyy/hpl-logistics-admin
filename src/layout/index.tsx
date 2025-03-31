import React, { useState } from 'react';
import { Menu, Home, ChevronLeft, ChevronRight, LogOut, X, MessageCircle } from 'lucide-react';
import { Outlet } from 'react-router';
import { useTranslation } from 'react-i18next';

export default function AdminLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const menuItems = [
    { title: t('side_bar.dashboard'), icon: Home, ref: '/' },
    { title: t('side_bar.messages'), icon: MessageCircle, ref: '/messages' },
  ];

  const Sidebar = ({ isMobile = false }) => (
    <div
      className={` ${isMobile ? 'fixed inset-0 z-50 bg-gray-900/50' : 'hidden lg:block'} ${!isMobile && (isSidebarCollapsed ? 'w-16' : 'w-64')} min-h-screen`}
    >
      {/* Mobile overlay close button */}
      {isMobile && (
        <div className="absolute right-4 top-4">
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="rounded-lg p-2 text-white hover:bg-gray-800"
          >
            <X size={24} />
          </button>
        </div>
      )}

      {/* Sidebar content */}
      <div
        className={` ${isMobile ? 'h-full w-64' : 'h-full w-full'} flex flex-col bg-gray-900 text-white`}
      >
        {/* Logo area */}
        <div className="flex h-16 items-center justify-between px-4">
          {(!isSidebarCollapsed || isMobile) && (
            <span className="text-xl font-bold">{t('side_bar_name')}</span>
          )}
          {!isMobile && (
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="rounded-lg p-2 hover:bg-gray-800"
            >
              {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          )}
        </div>

        {/* Navigation menu */}
        <nav className="mt-4 flex-1">
          {menuItems.map((item, index) => (
            <a
              key={index}
              href={item.ref}
              className="flex items-center px-4 py-3 text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
            >
              <item.icon size={20} />
              {(!isSidebarCollapsed || isMobile) && <span className="ml-4">{item.title}</span>}
            </a>
          ))}
        </nav>

        {/* Logout button */}
        <div className="p-4">
          <button className="flex items-center text-gray-300 transition-colors hover:text-white">
            <LogOut size={20} />
            {(!isSidebarCollapsed || isMobile) && (
              <span className="ml-4">{t('side_bar.logout')}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Menu */}
      {isMobileMenuOpen && <Sidebar isMobile />}

      {/* Main content area */}
      <div className="flex-1">
        {/* Top header */}
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 lg:px-6">
          <div className="flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="rounded-lg p-2 hover:bg-gray-100 lg:hidden"
            >
              <Menu size={24} />
            </button>
            <h1 className="ml-2 text-lg font-semibold sm:text-xl lg:ml-4">
              {t('side_bar.dashboard')}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <div className="group flex items-center rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 hover:bg-gray-100 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 lg:px-3 lg:py-2">
              <select
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                value={i18n.language}
                className="cursor-pointer appearance-none text-sm text-gray-700 group-hover:bg-gray-100 lg:text-base"
              >
                <option value="vi" className="lg:ml-1">
                  {t('language.vi')}
                </option>
                <option value="en" className="lg:ml-1">
                  {t('language.en')}
                </option>
              </select>

              <div className="pointer-events-none text-gray-500">
                <svg
                  className="h-4 w-4 lg:h-5 lg:w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
            {/* <div className="w-8 h-8 rounded-full bg-gray-200" />
            <span className="font-medium hidden sm:inline">Admin User</span> */}
          </div>
        </header>

        {/* Main content */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
