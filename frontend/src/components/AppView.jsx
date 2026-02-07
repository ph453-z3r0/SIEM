import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Users, AlertTriangle, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const AppView = ({ refreshInterval = 2000, isLive = true }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/v1/dashboard/app-stats');
            setData(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching app stats:", error);
        }
    };

    useEffect(() => {
        fetchData();
        let interval;
        if (isLive) {
            interval = setInterval(fetchData, refreshInterval);
        }
        return () => clearInterval(interval);
    }, [refreshInterval, isLive]);

    if (loading || !data) return <div className="p-10 text-center text-primary">Loading Application Security Data...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Application Security</h1>
                    <p className="text-gray-400 mt-1">Web application firewall status and user activity monitoring</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-lg flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-500" />
                        <span className="text-blue-400 text-sm font-medium">WAF Active</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Total Requests (24h)" value={data.total_requests.toLocaleString()} icon={Activity} color="text-blue-400" />
                <StatCard label="Error Rate" value={`${data.error_rate}%`} icon={AlertTriangle} color="text-red-400" />
                <StatCard label="Active Users" value={data.top_users.length} icon={Users} color="text-green-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Request Volume */}
                <div className="lg:col-span-2 bg-surface/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-200 mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-400" />
                        Request Volume (Last 24h)
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.request_data}>
                                <defs>
                                    <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="time" stroke="#64748b" />
                                <YAxis stroke="#64748b" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                                    itemStyle={{ color: '#e2e8f0' }}
                                />
                                <Area type="monotone" dataKey="requests" stroke="#3b82f6" fillOpacity={1} fill="url(#colorReq)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Users */}
                <div className="bg-surface/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-200 mb-6 flex items-center gap-2">
                        <Users className="w-5 h-5 text-green-400" />
                        Top Active Users
                    </h3>
                    <div className="space-y-4">
                        {data.top_users.map((user, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center text-xs font-bold text-white">
                                        {user.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <span className="text-gray-300 font-medium">{user.name}</span>
                                </div>
                                <span className="text-sm text-gray-400">{user.requests} req</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

             {/* Recent Alerts */}
             <div className="bg-surface/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-200 mb-6 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    Recent Application Alerts
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-800">
                                <th className="pb-3 pl-4">Risk</th>
                                <th className="pb-3">Alert</th>
                                <th className="pb-3 text-right pr-4">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {data.app_alerts.length > 0 ? (
                                data.app_alerts.map((alert) => (
                                    <tr key={alert.id} className="group hover:bg-white/5 transition-colors">
                                        <td className="py-3 pl-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                alert.risk > 80 ? 'bg-red-500/20 text-red-400' : 
                                                alert.risk > 50 ? 'bg-yellow-500/20 text-yellow-400' : 
                                                'bg-blue-500/20 text-blue-400'
                                            }`}>
                                                {alert.risk}
                                            </span>
                                        </td>
                                        <td className="py-3 text-gray-300 font-medium">{alert.title}</td>
                                        <td className="py-3 text-right text-gray-500 pr-4 font-mono text-sm">{alert.time}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="py-8 text-center text-gray-500">No recent application alerts</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className="bg-surface/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 flex items-center gap-4">
        <div className={`p-3 rounded-xl bg-gray-900/50 ${color}`}>
            <Icon className="w-6 h-6" />
        </div>
        <div>
            <p className="text-sm text-gray-400">{label}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

export default AppView;
