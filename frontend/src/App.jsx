import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Logs from './components/Logs';
import NetworkView from './components/NetworkView';
import AppView from './components/AppView';
import HardwareView from './components/HardwareView';
import Settings from './components/Settings';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Global Settings State
  const [refreshInterval, setRefreshInterval] = useState(2000);
  const [isLive, setIsLive] = useState(true);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard refreshInterval={refreshInterval} isLive={isLive} />;
      case 'network':
        return <NetworkView refreshInterval={refreshInterval} isLive={isLive} />;
      case 'application':
        return <AppView refreshInterval={refreshInterval} isLive={isLive} />;
      case 'hardware':
        return <HardwareView refreshInterval={refreshInterval} isLive={isLive} />;
      case 'logs':
        return <Logs />;
      case 'settings':
        return (
          <Settings
            refreshInterval={refreshInterval}
            setRefreshInterval={setRefreshInterval}
            isLive={isLive}
            setIsLive={setIsLive}
          />
        );
      default:
        return <Dashboard refreshInterval={refreshInterval} isLive={isLive} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-white flex">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <main
        className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}
      >
        <div className="p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
