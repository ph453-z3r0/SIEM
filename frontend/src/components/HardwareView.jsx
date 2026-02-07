import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Server, Cpu, HardDrive, Thermometer } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const HardwareView = ({ refreshInterval = 2000, isLive = true }) => {
    const [tempData, setTempData] = useState([]);
    const [racks, setRacks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/v1/dashboard/hardware-stats');
            setTempData(response.data.temp_data);
            setRacks(response.data.racks);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching hardware stats:", error);
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

    if (loading) return <div className="p-10 text-center text-primary">Loading Hardware Telemetry...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Hardware Health</h1>
                    <p className="text-gray-400 mt-1">Server rack monitoring and environmental controls</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Avg CPU Load" value="42%" icon={Cpu} color="text-blue-400" />
                <StatCard label="Memory Usage" value="64%" icon={HardDrive} color="text-purple-400" />
                <StatCard label="Avg Temp" value="48°C" icon={Thermometer} color="text-yellow-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Rack Status */}
                <div className="lg:col-span-2 bg-surface/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-200 mb-6 flex items-center gap-2">
                        <Server className="w-5 h-5 text-gray-400" />
                        Server Rack Status
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {racks.map((rack) => (
                            <div key={rack.id} className={`p-4 rounded-xl border ${rack.status === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                                rack.status === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' :
                                    'bg-gray-800/50 border-gray-700'
                                }`}>
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-mono text-sm text-gray-400">{rack.id}</span>
                                    <div className={`w-2 h-2 rounded-full ${rack.status === 'critical' ? 'bg-red-500 animate-pulse' :
                                        rack.status === 'warning' ? 'bg-yellow-500' :
                                            'bg-green-500'
                                        }`}></div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">Load</span>
                                        <span className="text-gray-300">{rack.load}%</span>
                                    </div>
                                    <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                                        <div className={`h-full ${rack.load > 80 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${rack.load}%` }}></div>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">Temp</span>
                                        <span className="text-gray-300">{rack.temp}°C</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Temperature Trend */}
                <div className="bg-surface/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-200 mb-6 flex items-center gap-2">
                        <Thermometer className="w-5 h-5 text-orange-400" />
                        Thermal Trend
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={tempData}>
                                <defs>
                                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                                    itemStyle={{ color: '#e2e8f0' }}
                                />
                                <Area type="monotone" dataKey="temp" stroke="#f97316" fillOpacity={1} fill="url(#colorTemp)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
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

export default HardwareView;
