import React from 'react';
import './LayoutStyles.css'; // Archivo de estilos que crearemos luego

const Header = () => {
  return (
    <header className="app-header">
      <div className="header-left">
        {/* Aquí puedes reemplazar con una imagen (<img>) de tu logo real */}
        <div className="logo-placeholder"></div>
        <h1 className="app-title">UIX Unisabana LLM</h1>
      </div>
      
      <div className="header-right">
        <nav className="header-nav">
          <button className="nav-btn">Configuración</button>
          <div className="user-profile-circle">CA</div>
        </nav>
      </div>
    </header>
  );
};

export default Header;