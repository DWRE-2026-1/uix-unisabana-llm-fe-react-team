import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import ChatPanel from './ChatPanel';

const MainLayout = () => {
  return (
    <div className="layout-wrapper">
      <Header />
      <div className="layout-body">
        <Sidebar />
        <ChatPanel />
      </div>
    </div>
  );
};

export default MainLayout;