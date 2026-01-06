import { useState, useEffect, useCallback } from 'react';

// Define the message types for type safety
type ExtensionMessage = 
  | { type: 'SCHMER_PONG'; payload?: { version?: string } }
  | { type: 'SCHMER_RECORDING_STARTED'; payload: { tool?: string; software?: string; startTime: number } }
  | { type: 'SCHMER_RECORDING_STOPPED'; payload: any }
  | { type: 'SCHMER_RECORDING_READY'; payload: { blob?: Blob; filename: string; projectId: string; tool: string } }
  | { type: 'SCHMER_ERROR'; payload: { message: string } };

export interface ExtensionStatus {
  isInstalled: boolean;
  isRecording: boolean;
  currentSession: {
    software: string;
    startTime: number;
  } | null;
  error: string | null;
  version?: string;
}

export const useExtensionBridge = () => {
  const [status, setStatus] = useState<ExtensionStatus>({
    isInstalled: false,
    isRecording: false,
    currentSession: null,
    error: null,
    version: undefined
  });

  const backendUrl = (import.meta as any)?.env?.VITE_BACKEND_URL as string | undefined;

  const uploadBlobToBackend = async (blob: Blob, filename: string, projectId: string, tool: string, autoMerge?: boolean) => {
    if (!backendUrl) return false;
    try {
      const form = new FormData();
      form.append('file', blob, filename);
      form.append('projectId', projectId);
      form.append('tool', tool);
      form.append('date', new Date().toISOString().slice(0,10));
      form.append('segment', String(Date.now()));
      const res = await fetch(`${backendUrl}/upload`, { method: 'POST', body: form, mode: 'cors' });
      const ok = res.ok;
      if (ok && autoMerge) {
        await fetch(`${backendUrl}/merge`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ projectId, tool, date: new Date().toISOString().slice(0,10) })
        });
      }
      return ok;
    } catch {
      return false;
    }
  };

  // Listener for messages FROM the extension (Content Script)
  const handleExtensionMessage = useCallback((event: MessageEvent) => {
    // Security: Only accept messages from the same window
    if (event.source !== window) return;

    const message = event.data as ExtensionMessage;

    switch (message.type) {
      case 'SCHMER_PONG':
        setStatus(prev => ({ ...prev, isInstalled: true, version: message.payload?.version }));
        break;
      
      case 'SCHMER_RECORDING_STARTED':
        setStatus(prev => ({
          ...prev,
          isRecording: true,
          error: null,
          currentSession: {
            software: message.payload.tool || message.payload.software || 'unknown',
            startTime: message.payload.startTime || Date.now()
          }
        }));
        break;

      case 'SCHMER_RECORDING_STOPPED':
        setStatus(prev => ({
          ...prev,
          isRecording: false,
          currentSession: null
        }));
        break;

      case 'SCHMER_RECORDING_READY': {
        const { blob, blobUrl, filename, projectId, tool } = message.payload as any;
        const handleUpload = async () => {
          try {
            let b: Blob | null = blob || null;
            if (!b && blobUrl) {
              try {
                const resp = await fetch(blobUrl, { mode: 'cors' });
                b = await resp.blob();
              } catch {}
            }
            if (b) {
              const ok = await uploadBlobToBackend(b, filename, projectId, tool, true);
              if (ok) {
                // Notify UI to refresh sessions
                window.postMessage({ type: 'SCHMER_REFRESH_SESSIONS', payload: { projectId } }, '*');
              } else {
                // Fallback to local download
                const url = URL.createObjectURL(b);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
              }
            }
          } catch {}
        };
        handleUpload();
        break;
      }

      case 'SCHMER_ERROR':
        setStatus(prev => ({ ...prev, error: message.payload.message }));
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('message', handleExtensionMessage);

    // Ping the extension repeatedly until we get a Pong
    // This detects if the extension is installed/active
    const pingInterval = setInterval(() => {
      if (!status.isInstalled) {
        window.postMessage({ type: 'SCHMER_PING' }, '*');
      }
    }, 1000);

    return () => {
      window.removeEventListener('message', handleExtensionMessage);
      clearInterval(pingInterval);
    };
  }, [handleExtensionMessage, status.isInstalled]);

  const startSession = (software: string, url: string, projectId: string, options?: Record<string, any>) => {
    // Open the tool tab immediately for a snappy UX
    try { window.open(url, '_blank'); } catch {}

    if (!status.isInstalled) {
        console.warn("Schmer Extension not detected. Opened the tool without recording.");
        return;
    }

    // Ask the extension to start recording without opening the tool again.
    window.postMessage({ 
        type: 'SCHMER_START_RECORDING', 
        payload: { projectId, tool: software, options: { ...(options || {}), toolUrl: url, openInExtension: false } } 
    }, '*');
  };

  const stopSession = () => {
    window.postMessage({ type: 'SCHMER_STOP_RECORDING' }, '*');
  };

  return {
    extensionStatus: status,
    startSession,
    stopSession
  };
};