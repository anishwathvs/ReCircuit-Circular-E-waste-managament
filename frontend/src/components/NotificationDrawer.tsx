import React, { useState, useEffect } from 'react';
import { Bell, Check, Clock, ExternalLink, X, Info, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  read: boolean;
  link?: string;
  createdAt: string;
}

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.getNotifications();
      setNotifications(res.notifications || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking all read:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-[#E5EBE5] animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-[#E5EBE5] flex items-center justify-between bg-[#F8FAF7]">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-full bg-[#EBF8E9] flex items-center justify-center text-[#084D36]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-[#151A17]">Platform Notifications</h3>
              <p className="text-xs text-[#6B756E]">Lifecycle alerts & dispatch updates</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-semibold text-[#084D36] hover:underline px-2 py-1"
              title="Mark all as read"
            >
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-[#6B756E] hover:bg-gray-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-sm text-[#6B756E]">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-[#EBF8E9] text-[#084D36] mx-auto flex items-center justify-center mb-3">
                <Check className="w-6 h-6" />
              </div>
              <p className="font-semibold text-sm text-[#151A17]">You're all caught up!</p>
              <p className="text-xs text-[#6B756E] mt-1">No pending circular notifications.</p>
            </div>
          ) : (
            notifications.map(item => (
              <div
                key={item.id}
                onClick={() => !item.read && handleMarkAsRead(item.id)}
                className={`p-4 rounded-xl border transition cursor-pointer relative ${
                  item.read
                    ? 'bg-white border-[#E5EBE5] opacity-80'
                    : 'bg-[#F8FAF7] border-[#084D36]/30 shadow-xs'
                }`}
              >
                {!item.read && (
                  <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#62B735]" />
                )}
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5">
                    {item.type === 'SUCCESS' && <CheckCircle2 className="w-4 h-4 text-[#16834D]" />}
                    {item.type === 'WARNING' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                    {item.type === 'ALERT' && <ShieldAlert className="w-4 h-4 text-red-500" />}
                    {(!item.type || item.type === 'INFO') && <Info className="w-4 h-4 text-[#084D36]" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-[#151A17]">{item.title}</h4>
                    <p className="text-xs text-[#6B756E] mt-1 leading-relaxed">{item.message}</p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#E5EBE5]/60">
                      <span className="text-[10px] text-[#8F9A92] flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </span>
                      {item.link && (
                        <a
                          href={item.link}
                          className="text-[11px] font-semibold text-[#084D36] hover:underline flex items-center space-x-1"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-[#E5EBE5] bg-[#F8FAF7] text-center">
          <p className="text-[11px] text-[#8F9A92]">
            Protected under ReCircuit Zero-Spam Circular Delivery Guarantee
          </p>
        </div>
      </div>
    </div>
  );
};

