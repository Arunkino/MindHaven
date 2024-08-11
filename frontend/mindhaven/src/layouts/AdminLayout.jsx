import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import Footer from '../components/Footer';

function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-purple-100 bg-calm-pattern">
      <AdminHeader />
      <main className="flex-grow container mx-auto px-4 py-4">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;