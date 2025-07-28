import React, { useState } from 'react';
import NouvelArrivant from './NouvelArrivant';
//import NotificationDemandes from './NotificationDemandes';
//import CalendrierDivision from './CalendrierDivision';
import '../styles/DashboardAdmin.css';

const DashboardAdmin = () => {
  const [activeTab, setActiveTab] = useState('accueil');

  return (
    <div className="dashboard-admin-container">
      <header className="dashboard-admin-header">
        <h1>Tableau de Bord Administrateur</h1>
      </header>
      <nav className="dashboard-admin-nav">
        <button
          className={activeTab === 'accueil' ? 'active' : ''}
          onClick={() => setActiveTab('accueil')}
        >Accueil</button>
        <button
          className={activeTab === 'ajouter' ? 'active' : ''}
          onClick={() => setActiveTab('ajouter')}
        >Ajouter Employé</button>
        <button
          className={activeTab === 'demandes' ? 'active' : ''}
          onClick={() => setActiveTab('demandes')}
        >Notifications</button>
      </nav>

      <main className="dashboard-admin-main">
        {activeTab === 'accueil' && <CalendrierDivision />}
        {activeTab === 'ajouter' && <NouvelArrivant />}
        {activeTab === 'demandes' && <NotificationDemandes />}
      </main>
    </div>
  );
};

export default DashboardAdmin;
