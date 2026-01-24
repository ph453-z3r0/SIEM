import React from 'react';
import { Shield, Users, Settings, Key, Database, Bell, Lock, Activity } from 'lucide-react';

const Admin = () => {
    return (
        <div className="p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-100 mb-2">Admin Panel</h2>
                <p className="text-gray-400">System configuration and administration</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-surface p-6 rounded-xl border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm text-gray-400">Total Users</h3>
                        <Users className="w-5 h-5 text-blue-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-100">3,600</p>
                    <p className="text-xs text-gray-500 mt-1">Active accounts</p>
                </div>
                <div className="bg-surface p-6 rounded-xl border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm text-gray-400">Active Sessions</h3>
                        <Activity className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-100">247</p>
                    <p className="text-xs text-gray-500 mt-1">Current sessions</p>
                </div>
                <div className="bg-surface p-6 rounded-xl border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm text-gray-400">System Uptime</h3>
                        <Database className="w-5 h-5 text-purple-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-100">99.9%</p>
                    <p className="text-xs text-green-500 mt-1">Last 30 days</p>
                </div>
                <div className="bg-surface p-6 rounded-xl border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm text-gray-400">Alerts</h3>
                        <Bell className="w-5 h-5 text-orange-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-100">12</p>
                    <p className="text-xs text-orange-500 mt-1">Requires attention</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <button className="p-6 bg-surface rounded-xl border border-gray-700 hover:border-primary transition-colors text-left">
                    <Users className="w-10 h-10 text-primary mb-4" />
                    <h3 className="text-lg font-semibold text-gray-200 mb-2">User Management</h3>
                    <p className="text-gray-500 text-sm">Manage users, roles, and permissions</p>
                </button>
                <button className="p-6 bg-surface rounded-xl border border-gray-700 hover:border-primary transition-colors text-left">
                    <Settings className="w-10 h-10 text-blue-500 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-200 mb-2">System Settings</h3>
                    <p className="text-gray-500 text-sm">Configure system parameters</p>
                </button>
                <button className="p-6 bg-surface rounded-xl border border-gray-700 hover:border-primary transition-colors text-left">
                    <Key className="w-10 h-10 text-green-500 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-200 mb-2">API Keys</h3>
                    <p className="text-gray-500 text-sm">Manage API authentication keys</p>
                </button>
                <button className="p-6 bg-surface rounded-xl border border-gray-700 hover:border-primary transition-colors text-left">
                    <Database className="w-10 h-10 text-purple-500 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-200 mb-2">Database</h3>
                    <p className="text-gray-500 text-sm">Database backup and maintenance</p>
                </button>
                <button className="p-6 bg-surface rounded-xl border border-gray-700 hover:border-primary transition-colors text-left">
                    <Lock className="w-10 h-10 text-red-500 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-200 mb-2">Security Policies</h3>
                    <p className="text-gray-500 text-sm">Configure security rules and policies</p>
                </button>
                <button className="p-6 bg-surface rounded-xl border border-gray-700 hover:border-primary transition-colors text-left">
                    <Bell className="w-10 h-10 text-orange-500 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-200 mb-2">Notifications</h3>
                    <p className="text-gray-500 text-sm">Configure alert notifications</p>
                </button>
            </div>

            <div className="bg-surface p-6 rounded-xl border border-gray-700">
                <h3 className="text-lg font-semibold text-gray-200 mb-4">System Status</h3>
                <div className="space-y-4">
                    {[
                        { service: 'API Server', status: 'Running', uptime: '99.9%', color: 'text-green-500' },
                        { service: 'Database', status: 'Running', uptime: '99.8%', color: 'text-green-500' },
                        { service: 'ML Engine', status: 'Running', uptime: '99.5%', color: 'text-green-500' },
                        { service: 'SOAR Engine', status: 'Running', uptime: '98.9%', color: 'text-green-500' },
                        { service: 'Log Collector', status: 'Running', uptime: '99.7%', color: 'text-green-500' },
                    ].map((service, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-background rounded-lg">
                            <div className="flex items-center gap-4">
                                <div className={`w-3 h-3 rounded-full ${service.color.replace('text-', 'bg-')} animate-pulse`}></div>
                                <span className="text-gray-200 font-medium">{service.service}</span>
                            </div>
                            <div className="flex items-center gap-6">
                                <span className="text-gray-400 text-sm">Uptime: {service.uptime}</span>
                                <span className={`px-3 py-1 bg-green-900/30 text-green-400 rounded text-xs font-medium`}>
                                    {service.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Admin;
