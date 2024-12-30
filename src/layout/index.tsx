import React, { useState } from 'react';
import { Menu, Home, ChevronLeft, ChevronRight, LogOut, X } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function AdminLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const menuItems = [
    { title: t('side_bar.dashboard'), icon: Home },
  ];

  const Sidebar = ({ isMobile = false }) => (
    <div className={`
      ${isMobile ? 'fixed inset-0 z-50 bg-gray-900/50' : 'hidden lg:block'}
      ${!isMobile && (isSidebarCollapsed ? 'w-16' : 'w-64')}
      min-h-screen
    `}>
      {/* Mobile overlay close button */}
      {isMobile && (
        <div className="absolute right-4 top-4">
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-lg text-white hover:bg-gray-800"
          >
            <X size={24} />
          </button>
        </div>
      )}

      {/* Sidebar content */}
      <div className={`
        ${isMobile ? 'w-64 h-full' : 'w-full h-full'}
        bg-gray-900 text-white flex flex-col
      `}>
        {/* Logo area */}
        <div className="h-16 flex items-center justify-between px-4">
          {(!isSidebarCollapsed || isMobile) && <span className="text-xl font-bold">
            {t('side_bar_name')}</span>}
          {!isMobile && (
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-800"
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
              href="#"
              className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <item.icon size={20} />
              {(!isSidebarCollapsed || isMobile) && <span className="ml-4">{item.title}</span>}
            </a>
          ))}
        </nav>

        {/* Logout button */}
        <div className="p-4">
          <button className="flex items-center text-gray-300 hover:text-white transition-colors">
            <LogOut size={20} />
            {(!isSidebarCollapsed || isMobile) && <span className="ml-4">{t('side_bar.logout')}</span>}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Menu */}
      {isMobileMenuOpen && <Sidebar isMobile />}

      {/* Main content area */}
      <div className="flex-1">
        {/* Top header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg sm:text-xl font-semibold ml-2 lg:ml-4">
              {t('side_bar.dashboard')}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <div className="relative group">
              <select
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                value={i18n.language}
                className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 
                py-1.5 lg:py-2 
                px-2 lg:px-3 
                text-sm lg:text-base 
                rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 
                focus:border-transparent hover:bg-gray-100 transition-colors cursor-pointer"
              > 
                <option value="vi">
                
                  <span className="lg:ml-1">{t('language.vi')}</span>
                </option>
                <option value="en">
                  <span className="lg:ml-1">{t('language.en')}</span>
                </option>
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
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