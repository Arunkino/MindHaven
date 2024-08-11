import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-purple-100 bg-calm-pattern">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-4">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;