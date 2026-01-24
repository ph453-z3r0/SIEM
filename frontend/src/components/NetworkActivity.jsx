import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Network, TrendingUp, TrendingDown, Activity, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const NetworkActivity = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/v1/dashboard/stats');
            setData(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching network data:", error);
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
                <h2 className="text-2xl font-bold text-gray-100 mb-2">Network Activity</h2>
                <p className="text-gray-400">Real-time network traffic and connection monitoring</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-surface p-6 rounded-xl border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm text-gray-400">Active Connections</h3>
                        <Network className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-100">1,247</p>
                    <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> +12% from last hour
                    </p>
                </div>
                <div className="bg-surface p-6 rounded-xl border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm text-gray-400">Bandwidth Usage</h3>
                        <Activity className="w-5 h-5 text-blue-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-100">847 MB/s</p>
                    <p className="text-xs text-gray-500 mt-1">Average throughput</p>
                </div>
                <div className="bg-surface p-6 rounded-xl border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm text-gray-400">Blocked IPs</h3>
                        <TrendingDown className="w-5 h-5 text-red-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-100">34</p>
                    <p className="text-xs text-red-500 mt-1">Last 24 hours</p>
                </div>
                <div className="bg-surface p-6 rounded-xl border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm text-gray-400">Total Traffic</h3>
                        <Network className="w-5 h-5 text-purple-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-100">2.4 TB</p>
                    <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
                </div>
            </div>

            <div className="bg-surface p-6 rounded-xl border border-gray-700 mb-6">
                <h3 className="text-lg font-semibold text-gray-200 mb-4">Network Traffic (Last 24 Hours)</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.charts.system_score}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                            <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} dot={false} name="Traffic (KB/s)" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-surface p-6 rounded-xl border border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-200 mb-4">Top Source IPs</h3>
                    <div className="space-y-3">
                        {['192.168.1.45', '10.0.0.128', '172.16.0.55', '192.168.1.89', '10.0.0.245'].map((ip, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-background rounded-lg">
                                <span className="text-gray-300 font-mono text-sm">{ip}</span>
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-400 text-sm">{Math.floor(Math.random() * 500 + 100)} connections</span>
                                    <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500" style={{ width: `${Math.random() * 100}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-surface p-6 rounded-xl border border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-200 mb-4">Protocol Distribution</h3>
                    <div className="space-y-3">
                        {[
                            { name: 'HTTPS', value: 65, color: 'bg-green-500' },
                            { name: 'HTTP', value: 20, color: 'bg-blue-500' },
                            { name: 'SSH', value: 10, color: 'bg-purple-500' },
                            { name: 'FTP', value: 3, color: 'bg-yellow-500' },
                            { name: 'Other', value: 2, color: 'bg-gray-500' }
                        ].map((protocol, idx) => (
                            <div key={idx} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-300 text-sm">{protocol.name}</span>
                                    <span className="text-gray-400 text-sm">{protocol.value}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <div className={`h-full ${protocol.color}`} style={{ width: `${protocol.value}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NetworkActivity;
