import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  X, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Volume2, 
  Download, 
  ExternalLink,
  Loader2,
  AlertCircle
} from 'lucide-react';

const FileViewer = ({ storeId, doc, onClose }) => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { displayName, mimeType, previewUrl } = doc;

  useEffect(() => {
    if (isTextBased(mimeType) && previewUrl) {
      fetchContent();
    }
  }, [previewUrl, mimeType]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await fetch(previewUrl);
      if (!res.ok) throw new Error('Failed to load file content');
      const text = await res.text();
      setContent(text);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isTextBased = (type) => {
    return type.includes('text') || 
           type.includes('markdown') || 
           type.includes('application/json') || 
           type.includes('application/xml') ||
           displayName.endsWith('.md') ||
           displayName.endsWith('.txt');
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
          <p className="text-gray-400">Cargando contenido...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center p-20 gap-4 text-red-400">
          <AlertCircle className="w-12 h-12" />
          <p>{error}</p>
          <button onClick={fetchContent} className="text-blue-400 underline">Reintentar</button>
        </div>
      );
    }

    if (mimeType.startsWith('image/')) {
      return (
        <div className="flex items-center justify-center w-full h-full overflow-auto bg-black/20 rounded-lg p-4">
          <img 
            src={previewUrl} 
            alt={displayName} 
            className="max-w-full max-h-[70vh] object-contain shadow-2xl rounded"
          />
        </div>
      );
    }

    if (mimeType.startsWith('video/')) {
      return (
        <div className="flex items-center justify-center w-full bg-black rounded-lg overflow-hidden">
          <video controls autoPlay className="max-w-full max-h-[70vh]">
            <source src={previewUrl} type={mimeType} />
            Tu navegador no soporta videos.
          </video>
        </div>
      );
    }

    if (mimeType.startsWith('audio/')) {
      return (
        <div className="flex flex-col items-center justify-center p-20 gap-8 bg-black/10 rounded-lg">
          <Volume2 className="w-20 h-20 text-blue-400" />
          <audio controls className="w-full max-w-md">
            <source src={previewUrl} type={mimeType} />
            Tu navegador no soporta audio.
          </audio>
        </div>
      );
    }

    if (mimeType === 'application/pdf' || displayName.toLowerCase().endsWith('.pdf')) {
      return (
        <iframe 
          src={`${previewUrl}#toolbar=0`} 
          className="w-full h-[70vh] rounded-lg border-0"
          title={displayName}
        />
      );
    }

    if (isTextBased(mimeType)) {
      if (mimeType.includes('markdown') || displayName.endsWith('.md')) {
        return (
          <div className="prose prose-invert max-w-none p-6 bg-gray-900/50 rounded-lg overflow-auto max-h-[70vh]">
            <ReactMarkdown>{content || ''}</ReactMarkdown>
          </div>
        );
      }
      return (
        <pre className="p-6 bg-gray-950 text-emerald-400 font-mono text-sm rounded-lg overflow-auto max-h-[70vh] border border-white/5">
          {content}
        </pre>
      );
    }

    // Default: Fallback to download info or generic message
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-6 text-center">
        <div className="p-6 bg-white/5 rounded-full">
          <FileText className="w-16 h-16 text-gray-400" />
        </div>
        <div>
          <h3 className="text-xl font-medium mb-2">Vista previa no disponible</h3>
          <p className="text-gray-400 mb-6">Este tipo de archivo ({mimeType}) no puede previsualizarse directamente.</p>
          <a 
            href={previewUrl} 
            download={displayName}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors font-medium"
          >
            <Download className="w-4 h-4" />
            Descargar para ver
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl bg-[#1e1e1e] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#252525]">
          <div className="flex items-center gap-3">
            {mimeType.startsWith('image/') ? <ImageIcon className="text-blue-400" /> : 
             mimeType.startsWith('video/') ? <Video className="text-purple-400" /> :
             <FileText className="text-gray-400" />}
            <div>
              <h2 className="font-semibold text-lg truncate max-w-xs sm:max-w-md">{displayName}</h2>
              <p className="text-xs text-gray-400 uppercase tracking-wider">{mimeType}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a 
              href={previewUrl} 
              download={displayName}
              className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
              title="Descargar archivo"
            >
              <Download className="w-5 h-5" />
            </a>
            <a 
              href={previewUrl} 
              target="_blank" 
              rel="noreferrer"
              className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
              title="Abrir en nueva pestaña"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-8 bg-[#181818]">
          {renderContent()}
        </div>

        {/* Footer info */}
        <div className="p-3 px-6 text-[10px] text-gray-500 flex justify-between bg-[#1a1a1a] border-t border-white/5">
          <span>ALMACÉN: {storeId}</span>
          <span>SOPORTADO: {navigator.onLine ? 'ONLINE' : 'OFFLINE'}</span>
        </div>
      </div>
    </div>
  );
};

export default FileViewer;
