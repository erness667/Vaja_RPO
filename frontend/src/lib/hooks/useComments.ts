'use client';

import { useState, useCallback, useEffect } from "react";
import {
  getApiCarsByCarIdComments,
  postApiCarsByCarIdComments,
  putApiCommentsById,
  deleteApiCommentsById,
  postApiCommentsByIdRate,
} from "@/client";
import "@/lib/api-client";
import type { Comment } from "@/lib/types/car";

interface CreateCommentData {
  content: string;
}

interface UpdateCommentData {
  content: string;
}

interface RateCommentData {
  rating: number;
}

export function useComments(carId: number | null) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!carId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getApiCarsByCarIdComments({
        path: { carId },
      });

      if (response.error || (response.response && !response.response.ok)) {
        const errorData = response.error as { message?: string } | undefined;
        setError(errorData?.message || "Napaka pri nalaganju komentarjev.");
        setIsLoading(false);
        return;
      }

      setComments((response.data as Comment[]) || []);
      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Prišlo je do nepričakovane napake.";
      setError(errorMessage);
      setIsLoading(false);
    }
  }, [carId]);

  const createComment = useCallback(async (data: CreateCommentData): Promise<Comment | null> => {
    if (!carId) return null;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await postApiCarsByCarIdComments({
        path: { carId },
        body: data,
      });

      if (response.error || (response.response && !response.response.ok)) {
        const errorData = response.error as { message?: string } | undefined;
        setError(errorData?.message || "Napaka pri dodajanju komentarja.");
        setIsSubmitting(false);
        return null;
      }

      const newComment = response.data as Comment;
      setComments(prev => [newComment, ...prev]);
      setIsSubmitting(false);
      return newComment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Prišlo je do nepričakovane napake.";
      setError(errorMessage);
      setIsSubmitting(false);
      return null;
    }
  }, [carId]);

  const updateComment = useCallback(async (commentId: number, data: UpdateCommentData): Promise<Comment | null> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await putApiCommentsById({
        path: { id: commentId },
        body: data,
      });

      if (response.error || (response.response && !response.response.ok)) {
        const errorData = response.error as { message?: string } | undefined;
        setError(errorData?.message || "Napaka pri posodabljanju komentarja.");
        setIsSubmitting(false);
        return null;
      }

      const updatedComment = response.data as Comment;
      setComments(prev => prev.map(c => c.id === commentId ? updatedComment : c));
      setIsSubmitting(false);
      return updatedComment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Prišlo je do nepričakovane napake.";
      setError(errorMessage);
      setIsSubmitting(false);
      return null;
    }
  }, []);

  const deleteComment = useCallback(async (commentId: number): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await deleteApiCommentsById({
        path: { id: commentId },
      });

      if (response.error || (response.response && !response.response.ok)) {
        const errorData = response.error as { message?: string } | undefined;
        setError(errorData?.message || "Napaka pri brisanju komentarja.");
        setIsSubmitting(false);
        return false;
      }

      setComments(prev => prev.filter(c => c.id !== commentId));
      setIsSubmitting(false);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Prišlo je do nepričakovane napake.";
      setError(errorMessage);
      setIsSubmitting(false);
      return false;
    }
  }, []);

  const rateComment = useCallback(async (commentId: number, data: RateCommentData): Promise<Comment | null> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await postApiCommentsByIdRate({
        path: { id: commentId },
        body: data,
      });

      if (response.error || (response.response && !response.response.ok)) {
        const errorData = response.error as { message?: string } | undefined;
        setError(errorData?.message || "Napaka pri ocenjevanju komentarja.");
        setIsSubmitting(false);
        return null;
      }

      const updatedComment = response.data as Comment;
      setComments(prev => prev.map(c => c.id === commentId ? updatedComment : c));
      setIsSubmitting(false);
      return updatedComment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Prišlo je do nepričakovane napake.";
      setError(errorMessage);
      setIsSubmitting(false);
      return null;
    }
  }, []);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return {
    comments,
    isLoading,
    error,
    isSubmitting,
    createComment,
    updateComment,
    deleteComment,
    rateComment,
    refetch: fetchComments,
    setError,
  };
}
