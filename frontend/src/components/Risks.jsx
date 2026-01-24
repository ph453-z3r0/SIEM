import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, TrendingUp, Shield, Activity, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Risks = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/v1/dashboard/stats');
            setData(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching risk data:", error);
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
                <h2 className="text-2xl font-bold text-gray-100 mb-2">Risk Management</h2>
                <p className="text-gray-400">Monitor and manage security risks across your infrastructure</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-surface p-6 rounded-xl border border-red-900/30">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm text-gray-400">High Risk Users</h3>
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-100">{data.stats.high_risk_users}</p>
                    <p className="text-xs text-red-500 mt-1">Requires immediate attention</p>
                </div>
                <div className="bg-surface p-6 rounded-xl border border-orange-900/30">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm text-gray-400">Active Anomalies</h3>
                        <Activity className="w-5 h-5 text-orange-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-100">{data.lists.anomalies.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Detected anomalies</p>
                </div>
                <div className="bg-surface p-6 rounded-xl border border-yellow-900/30">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm text-gray-400">Total Offenses</h3>
                        <Shield className="w-5 h-5 text-yellow-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-100">{data.stats.offenses_last_hour}</p>
                    <p className="text-xs text-gray-500 mt-1">Last hour</p>
                </div>
                <div className="bg-surface p-6 rounded-xl border border-green-900/30">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm text-gray-400">Risk Trend</h3>
                        <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-100">-12%</p>
                    <p className="text-xs text-green-500 mt-1">Improvement this week</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-surface p-6 rounded-xl border border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-200 mb-4">Threat Types Distribution</h3>
                    <div className="h-80">
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

                <div className="bg-surface p-6 rounded-xl border border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-200 mb-4">High Risk Users</h3>
                    <div className="space-y-3">
                        {data.lists.high_risk_users.map((user, idx) => (
                            <div key={idx} className="p-4 bg-background rounded-lg border border-red-900/30">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-red-900/30 rounded-full flex items-center justify-center">
                                            <span className="text-red-400 font-bold text-sm">
                                                {user.username.substring(0, 2).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-gray-200 font-medium">{user.username}</p>
                                            <p className="text-gray-500 text-xs">Risk Score: {user.score.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <button className="px-4 py-2 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50 transition-colors text-sm">
                                        Investigate
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-surface p-6 rounded-xl border border-gray-700">
                <h3 className="text-lg font-semibold text-gray-200 mb-4">Active Anomalies</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.lists.anomalies.map((anomaly, idx) => (
                        <div key={idx} className="p-4 bg-background rounded-lg border border-red-900/30">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            anomaly.status === 'new' ? 'bg-red-900/50 text-red-300' : 'bg-orange-900/50 text-orange-300'
                                        }`}>
                                            {anomaly.status.toUpperCase()}
                                        </span>
                                        <span className="text-red-400 font-bold text-sm">Risk: {anomaly.risk_score}</span>
                                    </div>
                                    <h4 className="text-gray-200 font-medium mb-1">{anomaly.title}</h4>
                                    <p className="text-gray-500 text-sm">User: {anomaly.entity_id}</p>
                                </div>
                                <span className="text-gray-600 text-xs">{anomaly.timestamp}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Risks;
