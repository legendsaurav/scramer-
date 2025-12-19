import { useState, useEffect, useCallback } from 'react';

// Define the message types for type safety
type ExtensionMessage = 
  | { type: 'SCHMER_PONG'; payload?: any }
  | { type: 'SCHMER_RECORDING_STARTED'; payload: { software: string; startTime: number } }
  | { type: 'SCHMER_RECORDING_STOPPED'; payload: any }
  | { type: 'SCHMER_ERROR'; payload: { message: string } };

export interface ExtensionStatus {
  isInstalled: boolean;
  isRecording: boolean;
  currentSession: {
    software: string;
    startTime: number;
  } | null;
  error: string | null;
}

export const useExtensionBridge = () => {
  const [status, setStatus] = useState<ExtensionStatus>({
    isInstalled: false,
    isRecording: false,
    currentSession: null,
    error: null
  });

  // Listener for messages FROM the extension (Content Script)
  const handleExtensionMessage = useCallback((event: MessageEvent) => {
    // Security: Only accept messages from the same window
    if (event.source !== window) return;

    const message = event.data as ExtensionMessage;

    switch (message.type) {
      case 'SCHMER_PONG':
        setStatus(prev => ({ ...prev, isInstalled: true }));
        break;
      
      case 'SCHMER_RECORDING_STARTED':
        setStatus(prev => ({
          ...prev,
          isRecording: true,
          error: null,
          currentSession: {
            software: message.payload.software,
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

  const startSession = (software: string, url: string, projectId: string) => {
    if (!status.isInstalled) {
        // Fallback: If extension isn't detected, we can alert or redirect to store
        console.warn("Schmer Extension not detected.");
        return;
    }

    // 1. Send command to extension
    window.postMessage({ 
        type: 'SCHMER_START_RECORDING', 
        payload: { software, url, projectId } 
    }, '*');

    // 2. Open the target software URL
    // The extension should detect this new tab/window and attach the recorder
    window.open(url, '_blank');
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