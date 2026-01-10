import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Header />
      <main className="min-h-screen pt-32 sm:pt-36 md:pt-40">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
