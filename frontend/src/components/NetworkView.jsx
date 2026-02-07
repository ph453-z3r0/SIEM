import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Globe, Shield, Activity, Wifi } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const NetworkView = ({ refreshInterval = 2000, isLive = true }) => {
    const [trafficData, setTrafficData] = useState([]);
    const [topPorts, setTopPorts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/v1/dashboard/network-stats');
            setTrafficData(response.data.traffic_data);
            setTopPorts(response.data.top_ports);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching network stats:", error);
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

    if (loading) return <div className="p-10 text-center text-primary">Loading Network Telemetry...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Network Security</h1>
                    <p className="text-gray-400 mt-1">Real-time traffic analysis and anomaly detection</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-lg flex items-center gap-2">
                        <Wifi className="w-4 h-4 text-green-500" />
                        <span className="text-green-400 text-sm font-medium">Firewall Active</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Traffic Overview */}
                <div className="lg:col-span-2 bg-surface/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-200 mb-6 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-blue-400" />
                        Network Traffic Volume (MB/s)
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trafficData}>
                                <defs>
                                    <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="time" stroke="#64748b" />
                                <YAxis stroke="#64748b" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                                    itemStyle={{ color: '#e2e8f0' }}
                                />
                                <Area type="monotone" dataKey="inbound" stroke="#3b82f6" fillOpacity={1} fill="url(#colorIn)" />
                                <Area type="monotone" dataKey="outbound" stroke="#10b981" fillOpacity={1} fill="url(#colorOut)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Ports */}
                <div className="bg-surface/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-200 mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-purple-400" />
                        Top Active Ports
                    </h3>
                    <div className="space-y-4">
                        {topPorts.map((port, idx) => (
                            <div key={idx} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-300">{port.name}</span>
                                    <span className="text-gray-500">{port.count.toLocaleString()} conn</span>
                                </div>
                                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-1000"
                                        style={{ width: `${(port.count / 15000) * 100}%`, backgroundColor: port.color }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NetworkView;
