import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Search, RefreshCw, Eye, AlertTriangle, Activity, Map, User, Terminal, Server, Globe } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const Dashboard = ({ refreshInterval = 2000, isLive = true }) => {
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
        let interval;
        if (isLive) {
            interval = setInterval(fetchData, refreshInterval);
        }
        return () => clearInterval(interval);
    }, [refreshInterval, isLive]);

    if (loading || !data) return (
        <div className="flex flex-col items-center justify-center h-96 text-primary gap-4">
            <Activity className="w-12 h-12 animate-spin" />
            <span className="text-xl font-mono tracking-widest">INITIALIZING TITAN-SIEM...</span>
        </div>
    );

    // Prepare Radar Data
    const radarData = [
        { subject: 'Security', A: data.stats.by_category?.security || 0, fullMark: 100 },
        { subject: 'Network', A: data.stats.by_category?.network || 0, fullMark: 100 },
        { subject: 'App', A: data.stats.by_category?.application || 0, fullMark: 100 },
        { subject: 'Hardware', A: data.stats.by_category?.hardware || 0, fullMark: 100 },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Command Center</h1>
                    <p className="text-gray-400 mt-1 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                        System Operational | Industrial Monitoring {isLive ? 'Active' : 'Paused'}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={fetchData} className="p-2 bg-surface border border-gray-700 rounded-lg hover:border-primary transition-colors group">
                        <RefreshCw className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:rotate-180 transition-all duration-500" />
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    label="Active Threats"
                    value={data.stats.offenses_last_hour}
                    icon={AlertTriangle}
                    color="text-danger"
                    trend="+12%"
                    trendUp={true}
                />
                <StatCard
                    label="Network Events"
                    value={data.stats.events_last_hour}
                    icon={Globe}
                    color="text-blue-400"
                    trend="+5%"
                    trendUp={true}
                />
                <StatCard
                    label="High Risk Users"
                    value={data.stats.high_risk_users}
                    icon={User}
                    color="text-warning"
                    trend="-2%"
                    trendUp={false}
                />
                <StatCard
                    label="System Health"
                    value="98.2%"
                    icon={Server}
                    color="text-green-400"
                    trend="Stable"
                    trendUp={true}
                />
            </div>

            {/* Main Visuals */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* System Score Area */}
                <div className="lg:col-span-2 bg-surface/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary" />
                            Threat Landscape
                        </h3>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.charts.system_score}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 12 }} />
                                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                                    itemStyle={{ color: '#e2e8f0' }}
                                />
                                <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Risk Radar */}
                <div className="bg-surface/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-200 mb-6 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-purple-400" />
                        Risk Distribution
                    </h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke="#334155" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                <Radar name="Events" dataKey="A" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.3} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                                    itemStyle={{ color: '#e2e8f0' }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active Threats Table */}
                <div className="bg-surface/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-danger" />
                        Active Threats
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-800">
                                    <th className="pb-3 pl-2">Severity</th>
                                    <th className="pb-3">Threat</th>
                                    <th className="pb-3">Entity</th>
                                    <th className="pb-3 text-right pr-2">Time</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {data.lists.recent_offenses.map((offense, idx) => (
                                    <tr key={idx} className="border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                                        <td className="py-3 pl-2">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${offense.risk_score > 80 ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                                }`}>
                                                {offense.risk_score}
                                            </span>
                                        </td>
                                        <td className="py-3 font-medium text-gray-200">{offense.title || "Security Alert"}</td>
                                        <td className="py-3 text-gray-400">{offense.user}</td>
                                        <td className="py-3 text-right pr-2 text-gray-500 font-mono">{offense.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Terminal Logs */}
                <div className="bg-black border border-gray-800 rounded-2xl p-6 font-mono text-xs relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
                    <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                        <Terminal className="w-5 h-5 text-green-500" />
                        Live Stream
                    </h3>
                    <div className="space-y-2 h-64 overflow-y-auto pr-2 custom-scrollbar">
                        {data.lists.live_logs.map((log, idx) => (
                            <div key={idx} className="flex gap-3 text-gray-400 hover:text-gray-200 transition-colors">
                                <span className="text-gray-600">[{log.timestamp.split(' ')[1]}]</span>
                                <span className={`${log.category === 'network' ? 'text-blue-400' :
                                    log.category === 'hardware' ? 'text-yellow-400' :
                                        log.category === 'application' ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                    {log.category ? log.category.toUpperCase() : 'SEC'}
                                </span>
                                <span className="flex-1 truncate">{log.event_type} - {log.source}</span>
                            </div>
                        ))}
                        <div className="animate-pulse text-primary">_</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, icon: Icon, color, trend, trendUp }) => (
    <div className="bg-surface/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl bg-gray-900/50 ${color}`}>
                <Icon className="w-6 h-6" />
            </div>
            {trend && (
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${trendUp ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                    {trend}
                </span>
            )}
        </div>
        <p className="text-gray-400 text-sm font-medium">{label}</p>
        <h3 className="text-3xl font-bold text-white mt-1">{typeof value === 'number' ? value.toLocaleString() : value}</h3>
    </div>
);

export default Dashboard;
