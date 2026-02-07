import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Filter, Download, Search, Clock } from 'lucide-react';

const Logs = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [showExportMenu, setShowExportMenu] = useState(false);

    const fetchData = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/v1/dashboard/stats');
            setData(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching logs data:", error);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const filteredLogs = data && filter === 'all'
        ? data.lists.live_logs
        : data?.lists.live_logs.filter(log => log.status === filter) || [];

    const exportLogs = (format) => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `sentinel_logs_${timestamp}.${format}`;
        let content = '';
        let type = '';

        if (format === 'json') {
            content = JSON.stringify(filteredLogs, null, 2);
            type = 'application/json';
        } else if (format === 'csv') {
            const headers = ['ID', 'Timestamp', 'Source', 'Category', 'Event Type', 'Entity', 'Status'];
            const rows = filteredLogs.map(log => [
                log.id,
                log.timestamp,
                log.source,
                log.category || 'N/A',
                log.event_type,
                log.entity_id,
                log.status
            ]);
            content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
            type = 'text/csv';
        }

        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowExportMenu(false);
    };

    if (loading || !data) return <div className="flex items-center justify-center h-96"><Clock className="w-8 h-8 animate-spin text-primary" /></div>;

    return (
        <div className="p-6" onClick={() => setShowExportMenu(false)}>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-100 mb-2">System Logs</h2>
                    <p className="text-gray-400">Comprehensive log management and analysis</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-surface px-4 py-2 rounded-lg border border-gray-700">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="bg-transparent text-gray-300 text-sm focus:outline-none"
                        >
                            <option value="all">All Logs</option>
                            <option value="processed">Processed</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>
                    <div className="relative">
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowExportMenu(!showExportMenu); }}
                            className="flex items-center gap-2 bg-primary px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            <span className="text-sm">Export</span>
                        </button>
                        {showExportMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-surface border border-gray-700 rounded-lg shadow-xl z-50">
                                <button
                                    onClick={() => exportLogs('json')}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 first:rounded-t-lg"
                                >
                                    Export as JSON
                                </button>
                                <button
                                    onClick={() => exportLogs('csv')}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 last:rounded-b-lg"
                                >
                                    Export as CSV
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-surface rounded-xl border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-background border-b border-gray-700">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Timestamp</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Source</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Event Type</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Entity</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {filteredLogs.map((log, idx) => (
                                <tr key={idx} className="hover:bg-background/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">#{log.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{log.timestamp}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-3 py-1 bg-blue-900/30 text-blue-400 rounded text-xs font-medium">
                                            {log.source}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{log.event_type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{log.entity_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 rounded text-xs font-medium ${log.status === 'processed'
                                            ? 'bg-green-900/30 text-green-400'
                                            : 'bg-yellow-900/30 text-yellow-400'
                                            }`}>
                                            {log.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Logs;
