import { useState } from 'react';
import { Upload, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const REQUIRED_FILES = [
  { name: 'level_1.mp3', description: 'Música Nivel 1' },
  { name: 'level_2.mp3', description: 'Música Nivel 2' },
  { name: 'level_3.mp3', description: 'Música Nivel 3' },
  { name: 'level_4.mp3', description: 'Música Nivel 4' },
  { name: 'level_5.mp3', description: 'Música Nivel 5' },
  { name: 'level_6.mp3', description: 'Música Nivel 6' },
  { name: 'level_7.mp3', description: 'Música Nivel 7' },
  { name: 'level_8.mp3', description: 'Música Nivel 8' },
  { name: 'level_9.mp3', description: 'Música Nivel 9' },
  { name: 'level_10.mp3', description: 'Música Nivel 10' },
  { name: 'start_theme.mp3', description: 'Música Menú Principal' },
  { name: 'match.wav', description: 'Efecto Match' },
  { name: 'win.mp3', description: 'Efecto Victoria' },
  { name: 'lose.mp3', description: 'Efecto Derrota' },
];

export function AudioUploader() {
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFileUpload = async (fileName: string, file: File) => {
    setUploading(fileName);
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fileName];
      return newErrors;
    });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', fileName);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-audio`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al subir archivo');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Error al subir archivo');
      }

      setUploadedFiles(prev => new Set([...prev, fileName]));
    } catch (error) {
      console.error('Error uploading file:', error);
      setErrors(prev => ({
        ...prev,
        [fileName]: error instanceof Error ? error.message : 'Error al subir archivo'
      }));
    } finally {
      setUploading(null);
    }
  };

  const handleFileSelect = (fileName: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(fileName, file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <h1 className="text-3xl font-bold text-white mb-2">
            Subir Archivos de Audio
          </h1>
          <p className="text-white/80 mb-6">
            Sube los archivos de audio CC0 que descargaste desde los sitios recomendados.
          </p>

          <div className="space-y-3">
            {REQUIRED_FILES.map(({ name, description }) => {
              const isUploaded = uploadedFiles.has(name);
              const isUploading = uploading === name;
              const error = errors[name];

              return (
                <div
                  key={name}
                  className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-white font-medium">{name}</span>
                        {isUploaded && (
                          <Check className="w-5 h-5 text-green-400" />
                        )}
                      </div>
                      <span className="text-white/60 text-sm">{description}</span>
                      {error && (
                        <div className="flex items-center gap-2 mt-1 text-red-400 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>{error}</span>
                        </div>
                      )}
                    </div>

                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => handleFileSelect(name, e)}
                        className="hidden"
                        disabled={isUploading}
                      />
                      <div className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg
                        transition-all
                        ${isUploading
                          ? 'bg-white/10 text-white/50 cursor-not-allowed'
                          : isUploaded
                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                        }
                      `}>
                        <Upload className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {isUploading ? 'Subiendo...' : isUploaded ? 'Reemplazar' : 'Subir'}
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-white/90 text-sm">
              <strong>Importante:</strong> Asegúrate de descargar archivos CC0 (dominio público) de sitios como
              FreePD.com, Pixabay, Freesound.org o OpenGameArt.org para evitar problemas de copyright.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
