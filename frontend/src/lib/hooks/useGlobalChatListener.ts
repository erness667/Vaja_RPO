'use client';

import { useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { getAccessToken, isAuthenticated } from "@/lib/utils/auth-storage";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5121';
const HUB_URL = `${API_URL}/chatHub`;

/**
 * Global hook to listen for incoming messages via SignalR
 * Dispatches 'newMessageReceived' event to trigger conversation updates
 */
export function useGlobalChatListener() {
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const isConnectingRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      return;
    }

    const connect = async () => {
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
          isConnectingRef.current = false;
          return;
        }

        // Close existing connection if any
        if (connectionRef.current) {
          try {
            await connectionRef.current.stop();
          } catch (err) {
            console.warn('Error stopping existing global chat connection:', err);
          }
          connectionRef.current = null;
        }

        // Create connection
        const connection = new signalR.HubConnectionBuilder()
          .withUrl(`${HUB_URL}?access_token=${encodeURIComponent(token)}`, {
            skipNegotiation: false,
            transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
          })
          .withAutomaticReconnect({
            nextRetryDelayInMilliseconds: (retryContext) => {
              if (retryContext.previousRetryCount === 0) return 0;
              if (retryContext.previousRetryCount === 1) return 2000;
              if (retryContext.previousRetryCount === 2) return 10000;
              return 30000;
            },
          })
          .build();

        // Listen for incoming messages and dispatch global event
        connection.on("ReceiveMessage", () => {
          // Dispatch custom event to trigger conversation updates everywhere
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("newMessageReceived"));
          }
        });

        connection.onclose((error) => {
          console.log('Global chat connection closed', error);
        });

        connection.onreconnecting((error) => {
          console.log('Global chat reconnecting', error);
        });

        connection.onreconnected((connectionId) => {
          console.log('Global chat reconnected', connectionId);
        });

        await connection.start();
        connectionRef.current = connection;
        console.log('Global chat connection established');
      } catch (error) {
        console.error('Global chat connection error:', error);
      } finally {
        isConnectingRef.current = false;
      }
    };

    connect();

    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop().catch(err => {
          console.warn('Error stopping global chat connection:', err);
        });
        connectionRef.current = null;
      }
    };
  }, []); // Only run once on mount, reconnect handled by SignalR

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop().catch(err => {
          console.warn('Error stopping global chat connection on unmount:', err);
        });
        connectionRef.current = null;
      }
    };
  }, []);
}

