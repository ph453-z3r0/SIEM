import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const Events = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/v1/dashboard/stats');
            setData(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching events data:", error);
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
                <h2 className="text-2xl font-bold text-gray-100 mb-2">Security Events</h2>
                <p className="text-gray-400">Real-time security event monitoring and analysis</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-surface p-6 rounded-xl border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm text-gray-400">Total Events</h3>
                        <Activity className="w-5 h-5 text-blue-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-100">{data.stats.events_last_hour.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">Last Hour</p>
                </div>
                <div className="bg-surface p-6 rounded-xl border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm text-gray-400">Critical Events</h3>
                        <AlertCircle className="w-5 h-5 text-red-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-100">{data.lists.anomalies.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Requires Attention</p>
                </div>
                <div className="bg-surface p-6 rounded-xl border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm text-gray-400">Processed</h3>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-100">{data.lists.live_logs.filter(l => l.status === 'processed').length}</p>
                    <p className="text-xs text-gray-500 mt-1">Events Analyzed</p>
                </div>
            </div>

            <div className="bg-surface p-6 rounded-xl border border-gray-700">
                <h3 className="text-lg font-semibold text-gray-200 mb-4">Recent Security Events</h3>
                <div className="space-y-3">
                    {data.lists.recent_offenses.map((offense, idx) => (
                        <div key={idx} className="p-4 bg-background rounded-lg border border-gray-700 hover:border-primary transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="px-3 py-1 bg-red-900/30 text-red-400 rounded text-xs font-medium">
                                            Offense #{offense.id}
                                        </span>
                                        <span className="text-gray-400 text-sm">{offense.time}</span>
                                    </div>
                                    <p className="text-gray-200 font-medium">User: {offense.user}</p>
                                    <p className="text-gray-500 text-sm mt-1">Event Count: {offense.event_count} events detected</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-gray-400 mb-2">Severity</div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-32 h-3 bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-yellow-500 to-red-500"
                                                style={{ width: `${offense.magnitude * 10}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm font-bold text-red-400">{offense.magnitude}/10</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Events;
