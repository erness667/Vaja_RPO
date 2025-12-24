'use client';

import { useEffect, useRef, useCallback } from "react";
import * as signalR from "@microsoft/signalr";
import { getAccessToken } from "@/lib/utils/auth-storage";
import type { FriendRequest, Friend } from "@/lib/types/friend";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5121';
const HUB_URL = `${API_URL}/chatHub`;

export function useFriendHub(
  onFriendRequestReceived?: (request: FriendRequest) => void,
  onFriendRequestAccepted?: (friend: Friend) => void,
  onFriendRequestRejected?: (request: FriendRequest) => void,
  onFriendRequestCancelled?: (request: FriendRequest) => void,
  onFriendRemoved?: (friendId: string) => void,
  onError?: (error: string) => void
) {
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const isConnectingRef = useRef(false);
  
  // Store callbacks in refs to avoid recreating connection when they change
  const onFriendRequestReceivedRef = useRef(onFriendRequestReceived);
  const onFriendRequestAcceptedRef = useRef(onFriendRequestAccepted);
  const onFriendRequestRejectedRef = useRef(onFriendRequestRejected);
  const onFriendRequestCancelledRef = useRef(onFriendRequestCancelled);
  const onFriendRemovedRef = useRef(onFriendRemoved);
  const onErrorRef = useRef(onError);

  // Update refs when callbacks change
  useEffect(() => {
    onFriendRequestReceivedRef.current = onFriendRequestReceived;
    onFriendRequestAcceptedRef.current = onFriendRequestAccepted;
    onFriendRequestRejectedRef.current = onFriendRequestRejected;
    onFriendRequestCancelledRef.current = onFriendRequestCancelled;
    onFriendRemovedRef.current = onFriendRemoved;
    onErrorRef.current = onError;
  }, [onFriendRequestReceived, onFriendRequestAccepted, onFriendRequestRejected, onFriendRequestCancelled, onFriendRemoved, onError]);

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
      connection.on("FriendRequestReceived", (request: FriendRequest) => {
        if (onFriendRequestReceivedRef.current) {
          onFriendRequestReceivedRef.current(request);
        }
      });

      connection.on("FriendRequestAccepted", (friend: Friend) => {
        if (onFriendRequestAcceptedRef.current) {
          onFriendRequestAcceptedRef.current(friend);
        }
      });

      connection.on("FriendRequestRejected", (request: FriendRequest) => {
        if (onFriendRequestRejectedRef.current) {
          onFriendRequestRejectedRef.current(request);
        }
      });

      connection.on("FriendRequestCancelled", (request: FriendRequest) => {
        if (onFriendRequestCancelledRef.current) {
          onFriendRequestCancelledRef.current(request);
        }
      });

      connection.on("FriendRemoved", (friendId: string) => {
        if (onFriendRemovedRef.current) {
          onFriendRemovedRef.current(friendId);
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
      console.log('SignalR connected for friend events');
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
    isConnected: connectionRef.current?.state === signalR.HubConnectionState.Connected,
    connect,
    disconnect,
  };
}

