import { useState } from 'react';
import { Send, Bell } from 'lucide-react';

export function AdminPushPanel() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('https://twinclash.org/');
  const [adminKey, setAdminKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!title.trim() || !body.trim() || !adminKey.trim()) {
      setError('Title, body, and admin key are required');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/.netlify/functions/send-push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey
        },
        body: JSON.stringify({ title, body, url })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send notifications');
      }

      setResult(data);
      setTitle('');
      setBody('');
      setUrl('https://twinclash.org/');
    } catch (err: any) {
      setError(err.message || 'Failed to send notifications');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-2xl p-6 max-w-md w-full border-2 border-purple-500">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-bold text-gray-800">Admin Push Panel</h3>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Admin Key
          </label>
          <input
            type="password"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            placeholder="Enter admin key"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Notification title"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Body
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Notification message"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://twinclash.org/"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={handleSend}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors"
        >
          <Send className="w-4 h-4" />
          {loading ? 'Sending...' : 'Send to All Users'}
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3 text-sm text-green-800">
            <div className="font-semibold mb-1">Sent Successfully!</div>
            <div>Total: {result.requested}</div>
            <div>Success: {result.successCount}</div>
            <div>Failed: {result.failureCount}</div>
          </div>
        )}
      </div>
    </div>
  );
}
