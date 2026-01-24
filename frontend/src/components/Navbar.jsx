import React from 'react';
import { LayoutDashboard, Activity, FileText, Network, FileBarChart, AlertTriangle, Shield, Users } from 'lucide-react';

const Navbar = ({ activeTab, setActiveTab }) => {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'events', label: 'Events', icon: Activity },
        { id: 'logs', label: 'Logs', icon: FileText },
        { id: 'network', label: 'Network Activity', icon: Network },
        { id: 'reports', label: 'Reports', icon: FileBarChart },
        { id: 'risks', label: 'Risks', icon: AlertTriangle },
        { id: 'admin', label: 'Admin', icon: Shield },
        { id: 'analytics', label: 'User Analytics', icon: Users },
    ];

    return (
        <nav className="bg-surface border-b border-gray-700">
            <div className="px-6 py-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Shield className="w-8 h-8 text-primary" />
                        <h1 className="text-2xl font-bold text-gray-100">Sentinel-X SIEM</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-gray-300" />
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 overflow-x-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                                    activeTab === item.id
                                        ? 'bg-primary text-white'
                                        : 'bg-background text-gray-400 hover:bg-gray-700 hover:text-white'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="text-sm font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
