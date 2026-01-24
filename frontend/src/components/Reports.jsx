import React from 'react';
import { FileBarChart, Download, Calendar, TrendingUp, FileText, Clock } from 'lucide-react';

const Reports = () => {
    const reports = [
        { id: 1, name: 'Daily Security Summary', date: '2026-01-24', size: '2.4 MB', status: 'Ready' },
        { id: 2, name: 'Weekly Threat Analysis', date: '2026-01-20', size: '8.7 MB', status: 'Ready' },
        { id: 3, name: 'Monthly Compliance Report', date: '2026-01-01', size: '15.2 MB', status: 'Ready' },
        { id: 4, name: 'Incident Response Summary', date: '2026-01-23', size: '3.1 MB', status: 'Ready' },
        { id: 5, name: 'User Activity Analysis', date: '2026-01-22', size: '5.6 MB', status: 'Processing' },
    ];

    return (
        <div className="p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-100 mb-2">Reports & Analytics</h2>
                <p className="text-gray-400">Generate and download comprehensive security reports</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-surface p-6 rounded-xl border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm text-gray-400">Total Reports</h3>
                        <FileText className="w-5 h-5 text-blue-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-100">247</p>
                    <p className="text-xs text-gray-500 mt-1">Generated this month</p>
                </div>
                <div className="bg-surface p-6 rounded-xl border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm text-gray-400">Scheduled Reports</h3>
                        <Calendar className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-100">12</p>
                    <p className="text-xs text-gray-500 mt-1">Active schedules</p>
                </div>
                <div className="bg-surface p-6 rounded-xl border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm text-gray-400">Report Growth</h3>
                        <TrendingUp className="w-5 h-5 text-purple-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-100">+18%</p>
                    <p className="text-xs text-green-500 mt-1">vs last month</p>
                </div>
            </div>

            <div className="bg-surface p-6 rounded-xl border border-gray-700 mb-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-200">Generate New Report</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="p-6 bg-background rounded-lg border border-gray-700 hover:border-primary transition-colors text-left">
                        <FileBarChart className="w-8 h-8 text-primary mb-3" />
                        <h4 className="text-gray-200 font-semibold mb-1">Security Overview</h4>
                        <p className="text-gray-500 text-sm">Comprehensive security status report</p>
                    </button>
                    <button className="p-6 bg-background rounded-lg border border-gray-700 hover:border-primary transition-colors text-left">
                        <TrendingUp className="w-8 h-8 text-green-500 mb-3" />
                        <h4 className="text-gray-200 font-semibold mb-1">Threat Analysis</h4>
                        <p className="text-gray-500 text-sm">Detailed threat intelligence report</p>
                    </button>
                    <button className="p-6 bg-background rounded-lg border border-gray-700 hover:border-primary transition-colors text-left">
                        <Calendar className="w-8 h-8 text-blue-500 mb-3" />
                        <h4 className="text-gray-200 font-semibold mb-1">Compliance Report</h4>
                        <p className="text-gray-500 text-sm">Regulatory compliance documentation</p>
                    </button>
                </div>
            </div>

            <div className="bg-surface p-6 rounded-xl border border-gray-700">
                <h3 className="text-lg font-semibold text-gray-200 mb-4">Recent Reports</h3>
                <div className="space-y-3">
                    {reports.map((report) => (
                        <div key={report.id} className="flex items-center justify-between p-4 bg-background rounded-lg border border-gray-700 hover:border-primary transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="text-gray-200 font-medium">{report.name}</h4>
                                    <p className="text-gray-500 text-sm mt-1">
                                        {report.date} • {report.size}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded text-xs font-medium ${
                                    report.status === 'Ready' 
                                        ? 'bg-green-900/30 text-green-400' 
                                        : 'bg-yellow-900/30 text-yellow-400'
                                }`}>
                                    {report.status}
                                </span>
                                {report.status === 'Ready' && (
                                    <button className="p-2 bg-primary rounded-lg hover:bg-blue-600 transition-colors">
                                        <Download className="w-4 h-4" />
                                    </button>
                                )}
                                {report.status === 'Processing' && (
                                    <Clock className="w-5 h-5 text-yellow-500 animate-spin" />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Reports;
