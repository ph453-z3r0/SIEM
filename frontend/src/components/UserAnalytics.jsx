import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, TrendingUp, Eye, Activity, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const UserAnalytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/v1/dashboard/stats');
            setData(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching analytics data:", error);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    if (loading || !data) return <div className="flex items-center justify-center h-96"><Clock className="w-8 h-8 animate-spin text-primary" /></div>;

    return (
        <div className="p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-100 mb-2">User Analytics</h2>
                <p className="text-gray-400">Behavioral analysis and user activity monitoring</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-surface p-6 rounded-xl border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm text-gray-400">Monitored Users</h3>
                        <Users className="w-5 h-5 text-blue-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-100">{data.stats.monitored_users.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">Active monitoring</p>
                </div>
                <div className="bg-surface p-6 rounded-xl border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm text-gray-400">High Risk Users</h3>
                        <Activity className="w-5 h-5 text-red-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-100">{data.stats.high_risk_users}</p>
                    <p className="text-xs text-red-500 mt-1">Elevated risk scores</p>
                </div>
                <div className="bg-surface p-6 rounded-xl border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm text-gray-400">Active Sessions</h3>
                        <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-100">1,247</p>
                    <p className="text-xs text-green-500 mt-1">+8% vs yesterday</p>
                </div>
                <div className="bg-surface p-6 rounded-xl border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm text-gray-400">Failed Logins</h3>
                        <Eye className="w-5 h-5 text-orange-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-100">34</p>
                    <p className="text-xs text-orange-500 mt-1">Last 24 hours</p>
                </div>
            </div>

            <div className="bg-surface p-6 rounded-xl border border-gray-700 mb-6">
                <h3 className="text-lg font-semibold text-gray-200 mb-4">User Activity Trend (Last 24 Hours)</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.charts.system_score}>
                            <defs>
                                <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                            <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Area type="monotone" dataKey="score" stroke="#3b82f6" fillOpacity={1} fill="url(#colorActivity)" name="User Activity" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-surface p-6 rounded-xl border border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-200 mb-4">High Risk Users</h3>
                    <div className="space-y-3">
                        {data.lists.high_risk_users.map((user, idx) => (
                            <div key={idx} className="p-4 bg-background rounded-lg border border-gray-700 hover:border-primary transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-red-900/50 to-orange-900/50 rounded-full flex items-center justify-center">
                                            <span className="text-white font-bold">
                                                {user.username.substring(0, 2).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-gray-200 font-medium">{user.username}</p>
                                            <p className="text-gray-500 text-sm">Risk Score: {user.score.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <button className="flex items-center gap-2 px-4 py-2 bg-primary rounded-lg hover:bg-blue-600 transition-colors">
                                        <Eye className="w-4 h-4" />
                                        <span className="text-sm">View</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-surface p-6 rounded-xl border border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-200 mb-4">User Behavior Patterns</h3>
                    <div className="space-y-4">
                        {[
                            { pattern: 'Normal Login Pattern', users: 3420, percentage: 95, color: 'bg-green-500' },
                            { pattern: 'Unusual Access Time', users: 124, percentage: 3.4, color: 'bg-yellow-500' },
                            { pattern: 'Multiple Failed Attempts', users: 34, percentage: 0.9, color: 'bg-orange-500' },
                            { pattern: 'Suspicious Activity', users: 22, percentage: 0.6, color: 'bg-red-500' },
                        ].map((item, idx) => (
                            <div key={idx} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-300 text-sm">{item.pattern}</span>
                                    <span className="text-gray-400 text-sm">{item.users} users ({item.percentage}%)</span>
                                </div>
                                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <div className={`h-full ${item.color}`} style={{ width: `${item.percentage}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserAnalytics;
