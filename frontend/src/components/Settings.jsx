import React from 'react';
import { Settings as SettingsIcon, Clock, Zap, Activity } from 'lucide-react';

const Settings = ({ refreshInterval, setRefreshInterval, isLive, setIsLive }) => {
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">System Settings</h1>
                    <p className="text-gray-400 mt-1">Configure dashboard behavior and real-time monitoring</p>
                </div>
            </div>

            <div className="bg-surface/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8">
                <h3 className="text-xl font-semibold text-gray-200 mb-6 flex items-center gap-2">
                    <Activity className="w-6 h-6 text-primary" />
                    Real-Time Monitoring
                </h3>

                <div className="space-y-8">
                    {/* Live Updates Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${isLive ? 'bg-green-500/10 text-green-400' : 'bg-gray-700/50 text-gray-400'}`}>
                                <Zap className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-200">Live Updates</h4>
                                <p className="text-sm text-gray-500">Pause or resume real-time data fetching</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsLive(!isLive)}
                            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${isLive ? 'bg-primary' : 'bg-gray-700'}`}
                        >
                            <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 ${isLive ? 'translate-x-7' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    {/* Refresh Rate Control */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-5 h-5 text-blue-400" />
                            <h4 className="font-medium text-gray-200">Data Refresh Rate</h4>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {[1000, 2000, 5000, 10000].map((interval) => (
                                <button
                                    key={interval}
                                    onClick={() => setRefreshInterval(interval)}
                                    className={`p-4 rounded-xl border transition-all duration-200 flex flex-col items-center justify-center gap-2 ${refreshInterval === interval
                                            ? 'bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                                            : 'bg-gray-900/50 border-gray-800 text-gray-400 hover:bg-gray-800 hover:border-gray-700'
                                        }`}
                                >
                                    <span className="text-lg font-bold">{interval / 1000}s</span>
                                    <span className="text-xs opacity-70">Interval</span>
                                </button>
                            ))}
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            Current setting: Updates every <span className="text-primary font-bold">{refreshInterval / 1000} seconds</span>.
                            Faster updates provide more real-time visibility but increase network load.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
