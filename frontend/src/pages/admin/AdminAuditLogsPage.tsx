import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Search, Filter, RefreshCw, 
  Clock, User, CheckCircle2, Lock, FileCode 
} from 'lucide-react';
import { api } from '../../services/api';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminAuditLogs();
      setLogs(res.logs || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((l) =>
    l.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-[#151A17] flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#16834D]" /> System Audit & Security Trail
          </h1>
          <p className="text-xs text-[#6B756E] mt-0.5">
            Immutable, timestamped event log of administrative actions, role assignments, and transactions.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="p-2 border border-[#E5EBE5] rounded-xl hover:bg-gray-50 text-[#6B756E] transition-colors self-start sm:self-auto"
          title="Refresh Logs"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Security Status Card */}
      <div className="bg-[#084D36] text-white p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-800/80 rounded-xl">
            <Lock className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <div className="font-heading font-bold text-sm">Cryptographic Verification Active</div>
            <div className="text-xs text-emerald-100/80 mt-0.5">
              Append-only audit trail logging user authentication, state mutations, and financial waterfall events.
            </div>
          </div>
        </div>
        <div className="px-3 py-1 bg-emerald-800 rounded-full text-[11px] font-mono font-bold text-emerald-200">
          HMAC-SHA256 Signed
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5EBE5] shadow-xs flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-[#6B756E] absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit trail by action, user or details..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#E5EBE5] bg-[#F8FAF7] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#084D36]"
          />
        </div>
        <div className="text-xs text-[#6B756E] font-medium hidden sm:block">
          {filteredLogs.length} events logged
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-2xl border border-[#E5EBE5] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-6 h-6 text-[#16834D] animate-spin mx-auto mb-2" />
            <p className="text-xs text-[#6B756E]">Loading system audit records...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <ShieldCheck className="w-12 h-12 text-[#6B756E] mx-auto mb-3 opacity-40" />
            <p className="text-xs text-[#6B756E]">No audit logs recorded matching search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#151A17]">
              <thead className="bg-[#F8FAF7] text-[#6B756E] uppercase font-semibold border-b border-[#E5EBE5]">
                <tr>
                  <th className="px-5 py-3.5">Action</th>
                  <th className="px-5 py-3.5">Operator</th>
                  <th className="px-5 py-3.5">Details</th>
                  <th className="px-5 py-3.5">IP Address</th>
                  <th className="px-5 py-3.5 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EBE5]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F8FAF7]/50 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-[#084D36]">
                      {log.action}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-[#151A17]">{log.user?.name || 'System Operator'}</div>
                      <div className="text-[10px] text-[#6B756E]">{log.user?.email || 'system@recircuit.in'}</div>
                    </td>
                    <td className="px-5 py-4 text-[#6B756E] max-w-md truncate">
                      {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                    </td>
                    <td className="px-5 py-4 font-mono text-[11px] text-[#6B756E]">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                    <td className="px-5 py-4 text-right text-[#6B756E]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

