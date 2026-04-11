"use client";

import { webProps } from "@/constants/configs";
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { communityMuted, communityRingAvatar } from "../constants/communityStyles";
import { formatPostDate } from "../utils/formatPostDate";
import type { SocialComment, SocialPost } from "../types";
import { PostCommentsSection } from "./PostCommentsSection";
import { IconChatBubble, IconThumbUp } from "./CommunityIcons";

type PostMediaLightboxProps = {
  post: SocialPost;
  locale: string;
  urls: string[];
  initialIndex: number;
  onClose: () => void;
  onToggleLike: (postId: number) => Promise<void>;
  onEnsureComments: () => Promise<void>;
  comments: SocialComment[];
  commentsLoading: boolean;
  commentText: string;
  onCommentTextChange: (value: string) => void;
  onCommentSubmit: (e: React.FormEvent) => void;
  commentSubmitting: boolean;
  likeBusy: boolean;
};

function isVideoUrl(url: string) {
  return /\.mp4($|\?)/i.test(url);
}

export function PostMediaLightbox({
  post,
  locale,
  urls,
  initialIndex,
  onClose,
  onToggleLike,
  onEnsureComments,
  comments,
  commentsLoading,
  commentText,
  onCommentTextChange,
  onCommentSubmit,
  commentSubmitting,
  likeBusy,
}: PostMediaLightboxProps) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(initialIndex);
  const [mounted, setMounted] = useState(false);
  const [likeAnimating, setLikeAnimating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    void onEnsureComments();
  }, [onEnsureComments]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (urls.length > 1) {
        if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + urls.length) % urls.length);
        if (e.key === "ArrowRight") setIndex((i) => (i + 1) % urls.length);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, urls.length]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const url = urls[index] ?? "";
  const video = isVideoUrl(url);
  const displayName =
    post.author_username || t("community.post.user_fallback", { id: String(post.user_id) });
  const hasStats = post.likes_count > 0 || post.comments_count > 0;
  const avatarHighlightClass = post.author_premium
    ? "ring-2 ring-amber-300/85 shadow-[0_0_0_3px_rgba(251,191,36,0.26),0_0_28px_rgba(251,191,36,0.34)]"
    : communityRingAvatar;

  const handleLike = useCallback(async () => {
    try {
      await onToggleLike(post.id);
      setLikeAnimating(true);
      window.setTimeout(() => setLikeAnimating(false), 240);
    } catch (e) {
      console.error(e);
    }
  }, [onToggleLike, post.id]);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-1 backdrop-blur-sm sm:p-3"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-post-author"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute right-3 top-3 z-[102] rounded-full bg-white/10 p-2.5 text-white transition hover:bg-white/20 sm:right-5 sm:top-5"
        aria-label={t("community.post.close_viewer")}
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div
        className="relative z-10 flex h-[98vh] max-h-[98vh] w-full max-w-[min(1680px,calc(100vw-0.5rem))] flex-col overflow-hidden rounded-2xl border border-white/10 bg-midnight shadow-2xl sm:max-w-[min(1680px,calc(100vw-1.5rem))] lg:h-[min(96vh,1100px)] lg:max-h-[min(96vh,1100px)] lg:flex-row lg:items-stretch"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Media */}
        <div className="relative flex min-h-0 flex-1 items-center justify-center bg-black/90 px-1 py-2 sm:py-3 lg:min-h-0 lg:min-w-0 lg:flex-[1.35] lg:px-3">
          {urls.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex((i) => (i - 1 + urls.length) % urls.length);
                }}
                className="absolute left-2 top-1/2 z-[101] -translate-y-1/2 rounded-full bg-black/50 p-2.5 text-white transition hover:bg-black/70"
                aria-label={t("community.post.previous_media")}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex((i) => (i + 1) % urls.length);
                }}
                className="absolute right-2 top-1/2 z-[101] -translate-y-1/2 rounded-full bg-black/50 p-2.5 text-white transition hover:bg-black/70"
                aria-label={t("community.post.next_media")}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
          {video ? (
            <video
              key={url}
              src={url}
              controls
              className="max-h-[min(78vh,920px)] w-full max-w-full object-contain lg:max-h-[min(92vh,1000px)]"
              playsInline
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={url}
              src={url}
              alt=""
              className="max-h-[min(78vh,920px)] w-full max-w-full object-contain lg:max-h-[min(92vh,1000px)]"
            />
          )}
          {urls.length > 1 && (
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/50 px-3 py-1.5">
              {urls.map((u, i) => (
                <button
                  key={u}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIndex(i);
                  }}
                  className={`h-2 w-2 rounded-full transition ${i === index ? "bg-white" : "bg-white/40 hover:bg-white/70"}`}
                  aria-label={`${i + 1} / ${urls.length}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Panel derecho — comentarios con scroll */}
        <div className="flex min-h-0 w-full flex-1 flex-col border-t border-white/10 bg-gray-900/95 lg:h-full lg:max-h-none lg:w-[min(100%,460px)] lg:flex-none lg:shrink-0 lg:border-l lg:border-t-0 xl:w-[min(100%,520px)]">
          <div className="shrink-0 border-b border-white/10 px-4 py-4 sm:px-5">
            <div className="flex gap-3">
              <img
                src={post.author_avatar || webProps.logo}
                alt=""
                className={`h-11 w-11 shrink-0 rounded-full object-cover sm:h-12 sm:w-12 ${avatarHighlightClass}`}
              />
              <div className="min-w-0 pt-0.5">
                <p id="lightbox-post-author" className="truncate text-base font-semibold text-white">
                  {displayName}
                </p>
                <p className={`text-sm ${communityMuted}`}>{formatPostDate(post.created_at, locale)}</p>
              </div>
            </div>
            {post.content.trim() ? (
              <p className="mt-3 max-h-40 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-slate-200 sm:max-h-48 sm:text-[15px]">
                {post.content.trim()}
              </p>
            ) : null}
            {hasStats && (
              <div className="mt-3 flex items-center justify-between text-sm">
                <span>
                  {post.likes_count > 0 && (
                    <span className="inline-flex items-center gap-2">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500/85 text-white">
                        <IconThumbUp
                          className={`h-3.5 w-3.5 transition-transform duration-200 ${
                            likeAnimating ? "scale-125" : "scale-100"
                          }`}
                        />
                      </span>
                      <span className="font-medium text-slate-100">{post.likes_count}</span>
                    </span>
                  )}
                </span>
                <span className={communityMuted}>
                  {post.comments_count > 0 &&
                    t("community.post.comments_count", { count: post.comments_count })}
                </span>
              </div>
            )}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleLike}
                disabled={likeBusy}
                aria-busy={likeBusy}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition disabled:opacity-50 ${
                  post.liked_by_me
                    ? "bg-white/10 text-cyan-300"
                    : `bg-white/5 ${communityMuted} hover:bg-white/10`
                }`}
              >
                <IconThumbUp
                  className={`h-4 w-4 transition-transform duration-200 ${
                    likeAnimating ? "scale-125" : "scale-100"
                  }`}
                />
                {t("community.post.like")}
              </button>
              <span
                className={`flex items-center justify-center gap-2 rounded-xl bg-white/5 py-2.5 text-sm font-semibold ${communityMuted}`}
              >
                <IconChatBubble className="h-4 w-4" />
                {t("community.post.comment")}
              </span>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-4 pt-2 sm:px-5">
            <PostCommentsSection
              comments={comments}
              loading={commentsLoading}
              locale={locale}
              commentText={commentText}
              onCommentTextChange={onCommentTextChange}
              onSubmit={onCommentSubmit}
              commentSubmitting={commentSubmitting}
              listWrapperClassName="min-h-0 flex-1 overflow-y-auto pr-1"
            />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
