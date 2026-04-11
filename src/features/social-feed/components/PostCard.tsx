"use client";

import { webProps } from "@/constants/configs";
import { useTranslation } from "react-i18next";
import { useCallback, useState } from "react";
import { communityCard, communityMuted, communityRingAvatar } from "../constants/communityStyles";
import { formatPostDate } from "../utils/formatPostDate";
import type { SocialComment, SocialPost } from "../types";
import { IconChatBubble, IconThumbUp } from "./CommunityIcons";
import { PostCommentsSection } from "./PostCommentsSection";
import { PostMediaLightbox } from "./PostMediaLightbox";

type PostCardProps = {
  post: SocialPost;
  locale: string;
  onToggleLike: (postId: number) => Promise<void>;
  onLoadComments: (postId: number) => Promise<SocialComment[]>;
  onAddComment: (postId: number, text: string) => Promise<SocialComment | null>;
};

const PREMIUM_AURA_THEMES = [
  {
    cardGlow:
      "bg-gradient-to-r from-amber-300/35 via-fuchsia-300/30 to-indigo-300/35",
    cardBorder:
      "border border-amber-300/40 shadow-[0_0_0_1px_rgba(251,191,36,0.28),0_0_35px_rgba(251,191,36,0.18)]",
    avatarGlow:
      "ring-2 ring-amber-300/85 shadow-[0_0_0_3px_rgba(251,191,36,0.26),0_0_28px_rgba(251,191,36,0.34)]",
  },
  {
    cardGlow:
      "bg-gradient-to-r from-cyan-300/35 via-sky-300/30 to-blue-300/35",
    cardBorder:
      "border border-cyan-300/40 shadow-[0_0_0_1px_rgba(103,232,249,0.26),0_0_35px_rgba(56,189,248,0.2)]",
    avatarGlow:
      "ring-2 ring-cyan-300/85 shadow-[0_0_0_3px_rgba(103,232,249,0.26),0_0_28px_rgba(56,189,248,0.34)]",
  },
  {
    cardGlow:
      "bg-gradient-to-r from-emerald-300/35 via-lime-300/28 to-teal-300/35",
    cardBorder:
      "border border-emerald-300/40 shadow-[0_0_0_1px_rgba(110,231,183,0.26),0_0_35px_rgba(20,184,166,0.2)]",
    avatarGlow:
      "ring-2 ring-emerald-300/85 shadow-[0_0_0_3px_rgba(110,231,183,0.26),0_0_28px_rgba(20,184,166,0.34)]",
  },
  {
    cardGlow:
      "bg-gradient-to-r from-violet-300/35 via-indigo-300/30 to-sky-300/35",
    cardBorder:
      "border border-violet-300/40 shadow-[0_0_0_1px_rgba(196,181,253,0.26),0_0_35px_rgba(168,85,247,0.2)]",
    avatarGlow:
      "ring-2 ring-violet-300/85 shadow-[0_0_0_3px_rgba(196,181,253,0.26),0_0_28px_rgba(168,85,247,0.34)]",
  },
] as const;

function getPremiumAuraTheme(userId: number) {
  const idx = Math.abs(userId) % PREMIUM_AURA_THEMES.length;
  return PREMIUM_AURA_THEMES[idx];
}

function MediaGrid({
  urls,
  onOpenLightbox,
}: {
  urls: string[];
  onOpenLightbox: (index: number) => void;
}) {
  if (urls.length === 0) return null;
  const gridClass =
    urls.length === 1
      ? "grid-cols-1"
      : urls.length === 2
        ? "grid-cols-2"
        : "grid-cols-2 sm:grid-cols-3";

  return (
    <div className={`mt-4 grid gap-2 overflow-hidden rounded-xl ${gridClass}`}>
      {urls.map((url, index) => (
        <MediaItem key={url} url={url} index={index} onOpenLightbox={onOpenLightbox} />
      ))}
    </div>
  );
}

function MediaItem({
  url,
  index,
  onOpenLightbox,
}: {
  url: string;
  index: number;
  onOpenLightbox: (index: number) => void;
}) {
  const { t } = useTranslation();
  const isVideo = /\.mp4($|\?)/i.test(url);
  const baseClass =
    "max-h-[min(520px,70vh)] w-full rounded-xl object-cover bg-black/60 ring-1 ring-white/10";
  if (isVideo) {
    return (
      <div className="group relative">
        <video src={url} controls className={baseClass} preload="metadata" />
        <button
          type="button"
          onClick={() => onOpenLightbox(index)}
          className="absolute right-2 top-2 rounded-full bg-black/55 p-2 text-white opacity-90 shadow-lg ring-1 ring-white/20 transition hover:bg-black/75 hover:opacity-100"
          title={t("community.post.open_large")}
          aria-label={t("community.post.open_large")}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            />
          </svg>
        </button>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={() => onOpenLightbox(index)}
      className="block w-full cursor-zoom-in overflow-hidden rounded-xl text-left ring-1 ring-white/10 transition hover:ring-gaming-primary-light/40 focus:outline-none focus:ring-2 focus:ring-gaming-primary-light/50"
      aria-label={t("community.post.open_large")}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="" className={baseClass} loading="lazy" />
    </button>
  );
}

export function PostCard({
  post,
  locale,
  onToggleLike,
  onLoadComments,
  onAddComment,
}: PostCardProps) {
  const { t } = useTranslation();
  const [likeBusy, setLikeBusy] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<SocialComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [likeAnimating, setLikeAnimating] = useState(false);

  const loadCommentsIfNeeded = useCallback(async () => {
    if (commentsLoaded) return;
    setCommentsLoading(true);
    try {
      const list = await onLoadComments(post.id);
      setComments(list);
      setCommentsLoaded(true);
    } catch (e) {
      console.error(e);
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  }, [commentsLoaded, onLoadComments, post.id]);

  const openComments = useCallback(async () => {
    const next = !commentsOpen;
    setCommentsOpen(next);
    if (next) await loadCommentsIfNeeded();
  }, [commentsOpen, loadCommentsIfNeeded]);

  const handleLike = async () => {
    setLikeBusy(true);
    try {
      await onToggleLike(post.id);
      setLikeAnimating(true);
      window.setTimeout(() => setLikeAnimating(false), 240);
    } catch (e) {
      console.error(e);
    } finally {
      setLikeBusy(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = commentText.trim();
    if (!trimmed) return;
    setCommentSubmitting(true);
    try {
      const created = await onAddComment(post.id, trimmed);
      if (created) {
        setComments((prev) => [...prev, created]);
        setCommentText("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const displayName =
    post.author_username ||
    t("community.post.user_fallback", { id: String(post.user_id) });

  const hasStats = post.likes_count > 0 || post.comments_count > 0;
  const premiumTheme = post.author_premium ? getPremiumAuraTheme(post.user_id) : null;
  const avatarHighlightClass = post.author_premium
    ? premiumTheme?.avatarGlow
    : communityRingAvatar;
  const premiumCardAura = post.author_premium ? premiumTheme?.cardBorder : "";

  return (
    <div className="relative">
      {post.author_premium && (
        <div
          className={`pointer-events-none absolute -inset-[2px] rounded-[1.12rem] ${premiumTheme?.cardGlow} opacity-90 blur-[3px] animate-pulse`}
          aria-hidden
        />
      )}
      <article className={`relative overflow-hidden ${communityCard} ${premiumCardAura}`}>
        <div className="flex gap-3 px-5 pb-2 pt-5 sm:gap-4 sm:px-6 sm:pt-6">
        <img
          src={post.author_avatar || webProps.logo}
          alt=""
          className={`h-12 w-12 shrink-0 rounded-full object-cover sm:h-14 sm:w-14 ${avatarHighlightClass}`}
        />
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="truncate text-base font-semibold text-white sm:text-lg">{displayName}</p>
          <p className={`text-sm ${communityMuted}`}>
            {formatPostDate(post.created_at, locale)}
          </p>
        </div>
      </div>

      <div className="px-5 pb-5 sm:px-6">
        {post.content.trim() ? (
          <p className="whitespace-pre-wrap text-base leading-relaxed text-slate-100 sm:text-lg">
            {post.content.trim()}
          </p>
        ) : null}
        <MediaGrid urls={post.media_urls ?? []} onOpenLightbox={setLightboxIndex} />
      </div>

      {hasStats && (
        <div className="flex items-center justify-between border-t border-white/10 px-5 py-3 text-sm sm:px-6">
          <span>
            {post.likes_count > 0 && (
              <span className="inline-flex items-center gap-2.5">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/85 text-white shadow-md shadow-cyan-900/30">
                  <IconThumbUp
                    className={`h-4 w-4 transition-transform duration-200 ${
                      likeAnimating ? "scale-125" : "scale-100"
                    }`}
                  />
                </span>
                <span className="font-medium text-slate-100">{post.likes_count}</span>
              </span>
            )}
          </span>
          <span className={`text-sm ${communityMuted}`}>
            {post.comments_count > 0 &&
              t("community.post.comments_count", { count: post.comments_count })}
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-px border-t border-white/10 bg-white/10">
        <button
          type="button"
          onClick={handleLike}
          disabled={likeBusy}
          className={`flex items-center justify-center gap-2.5 bg-gray-900/50 py-3.5 text-base font-semibold transition disabled:opacity-50 sm:py-4 sm:text-lg ${
            post.liked_by_me
              ? "text-cyan-300 hover:bg-white/5"
              : `${communityMuted} hover:bg-white/5 hover:text-slate-200`
          }`}
        >
          <IconThumbUp
            className={`h-5 w-5 shrink-0 transition-transform duration-200 ${
              likeAnimating ? "scale-125" : "scale-100"
            }`}
          />
          {t("community.post.like")}
        </button>
        <button
          type="button"
          onClick={openComments}
          className={`flex items-center justify-center gap-2.5 bg-gray-900/50 py-3.5 text-base font-semibold transition sm:py-4 sm:text-lg ${
            commentsOpen
              ? "bg-white/[0.07] text-white"
              : `${communityMuted} hover:bg-white/5 hover:text-slate-200`
          }`}
        >
          <IconChatBubble className="h-5 w-5 shrink-0" />
          {t("community.post.comment")}
        </button>
      </div>

        {commentsOpen && (
          <div className="border-t border-white/10 bg-midnight/50 px-5 py-5 sm:px-6">
            <PostCommentsSection
              comments={comments}
              loading={commentsLoading}
              locale={locale}
              commentText={commentText}
              onCommentTextChange={setCommentText}
              onSubmit={handleCommentSubmit}
              commentSubmitting={commentSubmitting}
              listWrapperClassName="mb-5 max-h-80 overflow-y-auto scrollbar-hide"
            />
          </div>
        )}

        {lightboxIndex !== null && (post.media_urls?.length ?? 0) > 0 && (
          <PostMediaLightbox
            post={post}
            locale={locale}
            urls={post.media_urls ?? []}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onToggleLike={onToggleLike}
            onEnsureComments={loadCommentsIfNeeded}
            comments={comments}
            commentsLoading={commentsLoading}
            commentText={commentText}
            onCommentTextChange={setCommentText}
            onCommentSubmit={handleCommentSubmit}
            commentSubmitting={commentSubmitting}
            likeBusy={likeBusy}
          />
        )}
      </article>
    </div>
  );
}
