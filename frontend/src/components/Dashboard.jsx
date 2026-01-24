import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Search, RefreshCw, Eye, AlertTriangle, Activity, Map, User } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, AreaChart, Area } from 'recharts';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/v1/dashboard/stats');
            setData(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // Real-time polling
        return () => clearInterval(interval);
    }, []);

    if (loading || !data) return <div className="flex items-center justify-center h-96 text-primary">Loading Sentinel-X...</div>;

    return (
        <div className="p-6">
            {/* Quick Search Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-100 mb-2">Dashboard Overview</h2>
                    <p className="text-gray-400">Real-time security monitoring and analytics</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search for User"
                            className="bg-surface border border-gray-600 rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary w-64"
                        />
                    </div>
                    <button onClick={fetchData} className="flex items-center gap-2 bg-surface border border-gray-600 px-4 py-2 rounded-md hover:border-primary transition-colors">
                        <RefreshCw className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-400">Refresh</span>
                    </button>
                </div>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <StatCard label="Monitored Users" value={data.stats.monitored_users.toLocaleString()} />
                <StatCard label="Current High Risk Users" value={data.stats.high_risk_users.toLocaleString()} />
                <StatCard label="Sense Events (Last Hour)" value={data.stats.events_last_hour.toLocaleString()} />
                <StatCard label="Offenses Generated (Last Hour)" value={data.stats.offenses_last_hour.toLocaleString()} />
            </div>

            {/* Main Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* System Score Chart */}
                <div className="lg:col-span-2 bg-surface p-4 rounded-xl border border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-semibold text-gray-200">System Score (Last Day)</h2>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.charts.system_score}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="score" stroke="#3b82f6" fillOpacity={1} fill="url(#colorScore)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Threat Types Bar Chart */}
                <div className="bg-surface p-4 rounded-xl border border-gray-700">
                    <h2 className="font-semibold text-gray-200 mb-4">Threat Types Distribution</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.charts.threat_types}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                                    {data.charts.threat_types.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Lists - 4 column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* High Risk Users List */}
                <div className="bg-surface p-4 rounded-xl border border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-semibold text-gray-200">High Risk Users</h2>
                        <span className="text-xs text-primary cursor-pointer">View all &gt;</span>
                    </div>
                    <div className="space-y-3">
                        {data.lists.high_risk_users.map((user, idx) => (
                            <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-xs">
                                        {user.username.substring(0, 2).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium">{user.username}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-bold text-gray-200">{user.score.toLocaleString()}</span>
                                    <Eye className="w-4 h-4 text-danger cursor-pointer" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Live Logs */}
                <div className="bg-surface p-4 rounded-xl border border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-semibold text-gray-200">Live Logs</h2>
                        <Activity className="w-4 h-4 text-green-500 animate-pulse" />
                    </div>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                        {data.lists.live_logs.map((log, idx) => (
                            <div key={idx} className="p-2 bg-background rounded border border-gray-700 text-xs">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-gray-400">#{log.id}</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                                        log.status === 'processed' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'
                                    }`}>
                                        {log.status}
                                    </span>
                                </div>
                                <div className="text-gray-300 font-medium">{log.event_type}</div>
                                <div className="text-gray-500 text-[10px] mt-1">
                                    <span className="text-blue-400">{log.source}</span> | {log.entity_id}
                                </div>
                                <div className="text-gray-600 text-[10px] mt-1">{log.timestamp}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Anomalies */}
                <div className="bg-surface p-4 rounded-xl border border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-semibold text-gray-200">Detected Anomalies</h2>
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                    </div>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                        {data.lists.anomalies.map((anomaly, idx) => (
                            <div key={idx} className="p-2 bg-background rounded border border-red-900/30 text-xs">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-red-400 font-bold">Risk: {anomaly.risk_score}</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                                        anomaly.status === 'new' ? 'bg-red-900 text-red-300' : 'bg-orange-900 text-orange-300'
                                    }`}>
                                        {anomaly.status}
                                    </span>
                                </div>
                                <div className="text-gray-300 font-medium">{anomaly.title}</div>
                                <div className="text-gray-500 text-[10px] mt-1">
                                    User: <span className="text-blue-400">{anomaly.entity_id}</span>
                                </div>
                                <div className="text-gray-600 text-[10px] mt-1">{anomaly.timestamp}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Offenses */}
                <div className="bg-surface p-4 rounded-xl border border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-semibold text-gray-200">Recent Offenses</h2>
                    </div>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {data.lists.recent_offenses.map((offense, idx) => (
                            <div key={idx} className="p-3 bg-background rounded-lg border border-gray-700">
                                <div className="text-xs text-gray-400 mb-1">Offense #{offense.id}</div>
                                <div className="font-medium text-primary text-sm">{offense.user}</div>
                                <div className="text-xs text-gray-500 mt-1">Events: {offense.event_count}</div>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-yellow-500 to-red-500"
                                            style={{ width: `${offense.magnitude * 10}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-xs font-bold whitespace-nowrap">{offense.magnitude}/10</span>
                                </div>
                                <div className="text-xs text-gray-600 mt-1">{offense.time}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value }) => (
    <div className="bg-surface p-6 rounded-xl border border-gray-700">
        <p className="text-sm text-gray-400 mb-2">{label}</p>
        <p className="text-4xl font-bold text-gray-100">{value}</p>
    </div>
);

export default Dashboard;
