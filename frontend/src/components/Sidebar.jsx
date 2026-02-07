import React from 'react';
import { LayoutDashboard, Shield, Server, Activity, FileText, Settings, Menu } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
        { id: 'network', label: 'Network Security', icon: Activity },
        { id: 'application', label: 'Application Security', icon: Shield },
        { id: 'hardware', label: 'Hardware Health', icon: Server },
        { id: 'logs', label: 'System Logs', icon: FileText },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className={`fixed left-0 top-0 h-full bg-surface border-r border-gray-800 transition-all duration-300 z-50 ${isOpen ? 'w-64' : 'w-20'}`}>
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <div className={`flex items-center gap-3 ${!isOpen && 'hidden'}`}>
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-lg tracking-wider text-gray-100">SENTINEL-X</span>
                </div>
                <button onClick={() => setIsOpen(!isOpen)} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                    <Menu className="w-5 h-5 text-gray-400" />
                </button>
            </div>

            <div className="py-6 space-y-2 px-3">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group relative
                ${isActive
                                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-200'}`} />
                            <span className={`font-medium whitespace-nowrap transition-opacity duration-200 ${!isOpen && 'opacity-0 w-0 overflow-hidden'}`}>
                                {item.label}
                            </span>

                            {!isOpen && (
                                <div className="absolute left-full ml-4 px-2 py-1 bg-gray-800 text-xs text-gray-200 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-gray-700">
                                    {item.label}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
                <div className={`flex items-center gap-3 ${!isOpen ? 'justify-center' : ''}`}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-xs font-bold">
                        JS
                    </div>
                    {isOpen && (
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-200">John Smith</span>
                            <span className="text-xs text-gray-500">Security Analyst</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
