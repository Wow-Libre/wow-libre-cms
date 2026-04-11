"use client";

import { useCallback, useState } from "react";
import {
  createComment,
  createPost,
  getFeedPosts,
  getPostComments,
  togglePostLike,
} from "../api/socialFeedApi";
import { FEED_PAGE_SIZE } from "../constants";
import type { SocialComment, SocialPost } from "../types";

export function useSocialFeed(token: string | undefined) {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadInitial = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    setPage(0);
    try {
      const { posts: list, hasMore: more } = await getFeedPosts(
        token,
        0,
        FEED_PAGE_SIZE
      );
      setPosts(list);
      setHasMore(more);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Load failed";
      setError(message);
      setPosts([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const loadMore = useCallback(async () => {
    if (!token || loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setLoadingMore(true);
    setError(null);
    try {
      const { posts: list, hasMore: more } = await getFeedPosts(
        token,
        nextPage,
        FEED_PAGE_SIZE
      );
      setPosts((prev) => {
        const ids = new Set(prev.map((p) => p.id));
        const merged = [...prev];
        for (const p of list) {
          if (!ids.has(p.id)) {
            merged.push(p);
            ids.add(p.id);
          }
        }
        return merged;
      });
      setPage(nextPage);
      setHasMore(more);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Load failed";
      setError(message);
    } finally {
      setLoadingMore(false);
    }
  }, [token, loadingMore, hasMore, page]);

  const submitPost = useCallback(
    async (content: string, mediaUrls: string[]) => {
      if (!token) return;
      const created = await createPost(token, content, mediaUrls);
      setPosts((prev) => [created, ...prev]);
    },
    [token]
  );

  const onToggleLike = useCallback(
    async (postId: number) => {
      if (!token) return;
      const result = await togglePostLike(token, postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                liked_by_me: result.liked,
                likes_count: result.likes_count,
              }
            : p
        )
      );
    },
    [token]
  );

  /** Comentarios cargados bajo demanda por publicación */
  const fetchComments = useCallback(
    async (postId: number): Promise<SocialComment[]> => {
      if (!token) return [];
      return getPostComments(token, postId, 0, 50);
    },
    [token]
  );

  const addComment = useCallback(
    async (postId: number, text: string) => {
      if (!token) return null;
      const comment = await createComment(token, postId, text);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, comments_count: p.comments_count + 1 }
            : p
        )
      );
      return comment;
    },
    [token]
  );

  return {
    posts,
    loading,
    loadingMore,
    error,
    hasMore,
    loadInitial,
    loadMore,
    submitPost,
    onToggleLike,
    fetchComments,
    addComment,
    setError,
  };
}
