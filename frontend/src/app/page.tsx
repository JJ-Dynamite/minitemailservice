'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [email, setEmail] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);

  useEffect(() => {
    if (email) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [email]);

  const createEmail = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiration_minutes: 60 }),
      });
      const data = await res.json();
      if (data.success) setEmail(data.data);
    } catch (error) {
      console.error('Failed to create email:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!email) return;
    try {
      const res = await fetch('http://localhost:3001/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: email.address }),
      });
      const data = await res.json();
      if (data.success) setMessages(data.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(email?.address || '');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-yellow-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="text-5xl">📧</span>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              MiniTempMail
            </h1>
          </div>
          <p className="text-gray-300 text-lg">Instant temporary email - protect your privacy</p>
        </div>

        {!email ? (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 shadow-2xl text-center">
            <div className="text-6xl mb-6">📬</div>
            <h2 className="text-2xl font-bold mb-4">Get Your Temporary Email</h2>
            <p className="text-gray-400 mb-8">Click below to generate a disposable email address</p>
            <button
              onClick={createEmail}
              disabled={loading}
              className="px-12 py-4 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 rounded-xl font-semibold text-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Creating...' : '📧 Generate Email'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Your temporary email:</p>
                  <p className="text-2xl font-mono font-bold text-yellow-400">{email.address}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={copyEmail}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                  >
                    📋 Copy
                  </button>
                  <button
                    onClick={createEmail}
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg transition-colors"
                  >
                    🔄 New
                  </button>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-4 text-sm text-gray-400">
                <span>⏰ Expires: {new Date(email.expires_at).toLocaleTimeString()}</span>
                <span>📬 Messages: {messages.length}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-700">
                  <h3 className="font-semibold text-yellow-400">Inbox ({messages.length})</h3>
                </div>
                <div className="divide-y divide-slate-700 max-h-96 overflow-y-auto">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedMessage(msg)}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedMessage?.id === msg.id
                          ? 'bg-yellow-900/20 border-l-2 border-yellow-400'
                          : 'hover:bg-slate-700/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm">{msg.from}</span>
                        {!msg.is_read && <span className="w-2 h-2 bg-yellow-400 rounded-full" />}
                      </div>
                      <p className="text-sm text-gray-400 truncate">{msg.subject}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(msg.received_at).toLocaleTimeString()}</p>
                    </div>
                  ))}
                  {messages.length === 0 && (
                    <div className="p-8 text-center text-gray-400">
                      <p className="text-4xl mb-2">📭</p>
                      <p className="text-sm">No messages yet</p>
                      <p className="text-xs">Waiting for incoming emails...</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
                {selectedMessage ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold">{selectedMessage.subject}</h3>
                        <p className="text-sm text-gray-400">From: {selectedMessage.from}</p>
                      </div>
                      <span className="text-sm text-gray-400">
                        {new Date(selectedMessage.received_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-slate-700/30 rounded-xl p-6">
                      <p className="text-gray-300">{selectedMessage.preview}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-6xl mb-4">📭</p>
                    <p className="text-gray-400">Select a message to read</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 grid grid-cols-4 gap-4">
          <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700 text-center">
            <div className="text-2xl mb-2">⚡</div>
            <h4 className="font-semibold text-sm">Instant</h4>
            <p className="text-gray-400 text-xs">No registration</p>
          </div>
          <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700 text-center">
            <div className="text-2xl mb-2">🔒</div>
            <h4 className="font-semibold text-sm">Private</h4>
            <p className="text-gray-400 text-xs">No tracking</p>
          </div>
          <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700 text-center">
            <div className="text-2xl mb-2">⏱️</div>
            <h4 className="font-semibold text-sm">Temporary</h4>
            <p className="text-gray-400 text-xs">Auto-expires</p>
          </div>
          <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700 text-center">
            <div className="text-2xl mb-2">🆓</div>
            <h4 className="font-semibold text-sm">Free</h4>
            <p className="text-gray-400 text-xs">No limits</p>
          </div>
        </div>
      </div>
    </main>
  );
}
