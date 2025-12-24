'use client';

import { useEffect, useRef, useCallback } from "react";
import * as signalR from "@microsoft/signalr";
import { getAccessToken } from "@/lib/utils/auth-storage";
import type { Message } from "@/lib/types/chat";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5121';
const HUB_URL = `${API_URL}/chatHub`;

export function useChatHub(
  onMessageReceived: (message: Message) => void,
  onMessageSent: (message: Message) => void,
  onMessageRead?: (messageId: number) => void,
  onError?: (error: string) => void
) {
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const isConnectingRef = useRef(false);
  
  // Store callbacks in refs to avoid recreating connection when they change
  const onMessageReceivedRef = useRef(onMessageReceived);
  const onMessageSentRef = useRef(onMessageSent);
  const onMessageReadRef = useRef(onMessageRead);
  const onErrorRef = useRef(onError);

  // Update refs when callbacks change
  useEffect(() => {
    onMessageReceivedRef.current = onMessageReceived;
    onMessageSentRef.current = onMessageSent;
    onMessageReadRef.current = onMessageRead;
    onErrorRef.current = onError;
  }, [onMessageReceived, onMessageSent, onMessageRead, onError]);

  const connect = useCallback(async () => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    if (connectionRef.current?.state === signalR.HubConnectionState.Connecting) {
      return;
    }

    if (isConnectingRef.current) {
      return;
    }

    isConnectingRef.current = true;

    try {
      const token = getAccessToken();
      if (!token) {
        console.warn('No access token available for SignalR connection');
        isConnectingRef.current = false;
        return;
      }

      // Close existing connection if any
      if (connectionRef.current) {
        try {
          await connectionRef.current.stop();
        } catch (err) {
          console.warn('Error stopping existing connection:', err);
        }
        connectionRef.current = null;
      }

      // Pass token as query parameter (required for WebSocket connections)
      const connection = new signalR.HubConnectionBuilder()
        .withUrl(`${HUB_URL}?access_token=${encodeURIComponent(token)}`, {
          skipNegotiation: false,
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            // Exponential backoff: 0s, 2s, 10s, 30s, then max 30s
            if (retryContext.previousRetryCount === 0) return 0;
            if (retryContext.previousRetryCount === 1) return 2000;
            if (retryContext.previousRetryCount === 2) return 10000;
            return 30000;
          },
        })
        .build();

      // Set up event handlers using refs to avoid stale closures
      connection.on("ReceiveMessage", (message: Message) => {
        onMessageReceivedRef.current(message);
      });

      connection.on("MessageSent", (message: Message) => {
        onMessageSentRef.current(message);
      });

      connection.on("MessageRead", (messageId: number) => {
        if (onMessageReadRef.current) {
          onMessageReadRef.current(messageId);
        }
      });

      connection.on("Error", (error: string) => {
        console.error('SignalR Error:', error);
        if (onErrorRef.current) {
          onErrorRef.current(error);
        }
      });

      connection.onclose((error) => {
        console.log('SignalR connection closed', error);
      });

      connection.onreconnecting((error) => {
        console.log('SignalR reconnecting', error);
      });

      connection.onreconnected((connectionId) => {
        console.log('SignalR reconnected', connectionId);
      });

      await connection.start();
      connectionRef.current = connection;
      console.log('SignalR connected');
    } catch (error) {
      console.error('SignalR connection error:', error);
      if (onErrorRef.current) {
        onErrorRef.current(error instanceof Error ? error.message : 'Connection error');
      }
    } finally {
      isConnectingRef.current = false;
    }
  }, []); // No dependencies - use refs for callbacks

  const disconnect = useCallback(async () => {
    if (connectionRef.current) {
      await connectionRef.current.stop();
      connectionRef.current = null;
    }
  }, []);

  const sendMessage = useCallback(async (receiverId: string, content: string): Promise<Message | null> => {
    if (!connectionRef.current) {
      console.error('SignalR connection not initialized');
      // Try to connect
      await connect();
      if (!connectionRef.current) {
        if (onErrorRef.current) {
          onErrorRef.current('Failed to establish connection');
        }
        return null;
      }
    }

    const state = connectionRef.current.state;
    if (state !== signalR.HubConnectionState.Connected) {
      console.warn(`SignalR not connected, state: ${state}. Attempting to connect...`);
      try {
        await connect();
      } catch (err) {
        console.error('Failed to connect:', err);
        if (onErrorRef.current) {
          onErrorRef.current('Failed to connect to chat server');
        }
        return null;
      }
      
      if (connectionRef.current && connectionRef.current.state !== signalR.HubConnectionState.Connected) {
        console.error('SignalR still not connected after reconnect attempt');
        if (onErrorRef.current) {
          onErrorRef.current('Connection not available');
        }
        return null;
      }
    }

    try {
      await connectionRef.current.invoke("SendMessage", receiverId, content);
      // The actual message will come back via MessageSent event
      return null;
    } catch (error) {
      console.error('Error sending message:', error);
      if (onErrorRef.current) {
        onErrorRef.current(error instanceof Error ? error.message : 'Error sending message');
      }
      return null;
    }
  }, [connect]);

  const markAsRead = useCallback(async (messageId: number): Promise<void> => {
    if (!connectionRef.current || connectionRef.current.state !== signalR.HubConnectionState.Connected) {
      return;
    }

    try {
      await connectionRef.current.invoke("MarkAsRead", messageId);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }, []);

  useEffect(() => {
    // Only connect if we have a token
    const token = getAccessToken();
    if (token) {
      connect();
    }

    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  return {
    sendMessage,
    markAsRead,
    isConnected: connectionRef.current?.state === signalR.HubConnectionState.Connected,
    connect,
    disconnect,
  };
}

