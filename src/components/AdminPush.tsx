import { useState, useEffect } from 'react';
import { Send, Lock, AlertCircle, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';

interface AdminPushProps {
  onBack: () => void;
}

export function AdminPush({ onBack }: AdminPushProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('https://twinclash.org/');

  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'twinclash2025';
  const ADMIN_PUSH_KEY = import.meta.env.VITE_ADMIN_PUSH_KEY || 'twinclash_push_admin_2025';

  useEffect(() => {
    const authenticated = sessionStorage.getItem('admin_authenticated');
    if (authenticated === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
      setPasswordError('');
      setPasswordInput('');
    } else {
      setPasswordError('Contraseña incorrecta. Acceso denegado.');
      setPasswordInput('');
    }
  };

  const handleSendPush = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !body.trim()) {
      setResult({
        type: 'error',
        message: 'El título y el mensaje son obligatorios'
      });
      return;
    }

    setIsSending(true);
    setResult(null);

    try {
      const response = await fetch('/.netlify/functions/send-push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': ADMIN_PUSH_KEY
        },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          url: url.trim() || 'https://twinclash.org/'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar notificaciones');
      }

      setResult({
        type: 'success',
        message: `¡Enviado exitosamente! ${data.sent} usuarios recibieron la notificación. ${data.failed > 0 ? `${data.failed} fallidos.` : ''}`
      });

      setTitle('');
      setBody('');
      setUrl('https://twinclash.org/');
    } catch (error: any) {
      console.error('[AdminPush] Error:', error);
      setResult({
        type: 'error',
        message: error.message || 'Error al enviar notificaciones. Revisa la consola.'
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-purple-100 p-4 rounded-full">
              <Lock size={48} className="text-purple-600" />
            </div>
          </div>

          <h1 className="text-3xl font-black text-gray-800 text-center mb-2">
            Panel de Administración
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Notificaciones Push
          </p>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="Ingresa la contraseña"
                autoFocus
              />
            </div>

            {passwordError && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-800">{passwordError}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Lock size={20} />
              Acceder
            </button>
          </form>

          <button
            onClick={onBack}
            className="w-full mt-4 text-gray-600 hover:text-gray-800 font-medium py-2 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 py-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white hover:text-purple-300 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Volver al juego
        </button>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-white">
            <div className="flex items-center gap-4 mb-2">
              <div className="bg-white/20 p-3 rounded-full">
                <Send size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-black">Panel de Push</h1>
                <p className="text-purple-100">Envía notificaciones a todos los usuarios</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSendPush} className="p-8 space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-2">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-lg"
                placeholder="Ej: ¡Nuevo nivel disponible!"
                maxLength={100}
                required
              />
              <p className="text-xs text-gray-500 mt-1">{title.length}/100 caracteres</p>
            </div>

            <div>
              <label htmlFor="body" className="block text-sm font-bold text-gray-700 mb-2">
                Mensaje <span className="text-red-500">*</span>
              </label>
              <textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-lg resize-none"
                placeholder="Ej: Descubre el mundo 5 con nuevos desafíos..."
                rows={4}
                maxLength={300}
                required
              />
              <p className="text-xs text-gray-500 mt-1">{body.length}/300 caracteres</p>
            </div>

            <div>
              <label htmlFor="url" className="block text-sm font-bold text-gray-700 mb-2">
                URL (opcional)
              </label>
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="https://twinclash.org/"
              />
              <p className="text-xs text-gray-500 mt-1">URL a la que irá el usuario al hacer clic</p>
            </div>

            {result && (
              <div className={`flex items-start gap-3 p-4 rounded-xl border-l-4 ${
                result.type === 'success'
                  ? 'bg-green-50 border-green-500'
                  : 'bg-red-50 border-red-500'
              }`}>
                {result.type === 'success' ? (
                  <CheckCircle size={24} className="text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle size={24} className="text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className={`font-semibold ${
                    result.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {result.type === 'success' ? '¡Éxito!' : 'Error'}
                  </p>
                  <p className={`text-sm ${
                    result.type === 'success' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {result.message}
                  </p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSending}
              className={`w-full font-bold py-5 rounded-xl transition-all flex items-center justify-center gap-3 text-lg ${
                isSending
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl'
              } text-white`}
            >
              {isSending ? (
                <>
                  <Loader2 size={24} className="animate-spin" />
                  Enviando notificaciones...
                </>
              ) : (
                <>
                  <Send size={24} />
                  Enviar notificación a TODOS los usuarios
                </>
              )}
            </button>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
              <p className="text-sm text-blue-900 font-semibold mb-2">ℹ️ Información importante:</p>
              <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                <li>Solo se envía a usuarios activos (últimos 30 días)</li>
                <li>Los tokens inválidos se eliminan automáticamente</li>
                <li>Las notificaciones pueden tardar unos segundos</li>
                <li>Los usuarios deben tener notificaciones activadas</li>
              </ul>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
