import { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Events from './components/Events';
import Logs from './components/Logs';
import NetworkActivity from './components/NetworkActivity';
import Reports from './components/Reports';
import Risks from './components/Risks';
import Admin from './components/Admin';
import UserAnalytics from './components/UserAnalytics';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'events':
        return <Events />;
      case 'logs':
        return <Logs />;
      case 'network':
        return <NetworkActivity />;
      case 'reports':
        return <Reports />;
      case 'risks':
        return <Risks />;
      case 'admin':
        return <Admin />;
      case 'analytics':
        return <UserAnalytics />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="text-white">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
