"use client";

import { useUserContext } from "@/context/UserContext";
import Cookies from "js-cookie";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import { getSubscriptionActive } from "@/api/subscriptions";
import { communityCard } from "../constants/communityStyles";
import { CommunityEmptyState } from "./CommunityEmptyState";
import { CommunityShell } from "./CommunityShell";
import { CreatePostComposer } from "./CreatePostComposer";
import { FeedLoadingSkeleton } from "./FeedLoadingSkeleton";
import { PostCard } from "./PostCard";
import { StoriesStripSkeleton } from "./StoriesStrip";
import { useSocialFeed } from "../hooks/useSocialFeed";
import { SubscriptionUpsellCard } from "./SubscriptionUpsellCard";

function ComposerPlaceholder() {
  return (
    <div
      className={`min-h-[120px] overflow-hidden ${communityCard}`}
      aria-hidden
    >
      <div className="flex items-center gap-3 p-5 sm:gap-4 sm:p-6">
        <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-white/10 sm:h-14 sm:w-14" />
        <div className="h-12 min-h-[52px] flex-1 animate-pulse rounded-2xl bg-white/10" />
      </div>
      <div className="border-t border-white/10 py-4">
        <div className="mx-auto h-5 w-32 animate-pulse rounded bg-white/5" />
      </div>
    </div>
  );
}

export function SocialFeedPage() {
  const { t, i18n } = useTranslation();
  const { user } = useUserContext();
  const [mounted, setMounted] = useState(false);
  const [subscriptionChecked, setSubscriptionChecked] = useState(false);
  const [showUpsellCard, setShowUpsellCard] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState<
    boolean | null
  >(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const token = mounted ? Cookies.get("token") : undefined;
  const locale = user.language || i18n.language || "en";

  const {
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
  } = useSocialFeed(token);

  useEffect(() => {
    if (token) {
      void loadInitial();
    }
  }, [token, loadInitial]);

  useEffect(() => {
    if (!token || !user.logged_in || subscriptionChecked) return;
    let cancelled = false;

    (async () => {
      try {
        const active = await getSubscriptionActive(token);
        if (!cancelled) {
          setHasActiveSubscription(active);
          if (!active) {
            setShowUpsellCard(true);
          }
        }
      } catch (err) {
        console.warn("[community] subscription check failed", err);
      } finally {
        if (!cancelled) setSubscriptionChecked(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, user.logged_in, subscriptionChecked]);

  useEffect(() => {
    const node = loadMoreTriggerRef.current;
    if (!node || !hasMore || loading || loadingMore || !!error || posts.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      { root: null, rootMargin: "420px 0px", threshold: 0.01 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, error, posts.length, loadMore]);

  const handleCreatePost = async (content: string, mediaUrls: string[]) => {
    await submitPost(content, mediaUrls);
  };

  if (!mounted) {
    return (
      <CommunityShell
        strip={<StoriesStripSkeleton />}
        composer={<ComposerPlaceholder />}
      >
        <FeedLoadingSkeleton />
      </CommunityShell>
    );
  }

  if (!token || !user.logged_in) {
    return null;
  }

  return (
    <CommunityShell
      composer={
        <CreatePostComposer
          token={token}
          hasActiveSubscription={hasActiveSubscription}
          onPostCreated={handleCreatePost}
        />
      }
      leftRailBottom={showUpsellCard ? <SubscriptionUpsellCard /> : null}
    >
        {loading && <FeedLoadingSkeleton />}

        {!loading && error && (
          <div
            className="rounded-2xl border border-red-500/25 bg-red-950/30 px-6 py-7 text-slate-100 shadow-xl shadow-black/20 backdrop-blur-md sm:px-8 sm:py-8"
            role="alert"
          >
            <p className="text-lg font-semibold text-white sm:text-xl">{t("community.error.load")}</p>
            <p className="mt-3 text-base text-slate-400">{error}</p>
            <button
              type="button"
              onClick={() => loadInitial()}
              className="mt-6 rounded-xl bg-gaming-primary-main px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-gaming-primary-dark/30 transition hover:bg-gaming-primary-hover sm:text-lg"
            >
              {t("community.retry")}
            </button>
          </div>
        )}

        {!loading && !error && posts.length === 0 && <CommunityEmptyState />}

        {!loading &&
          !error &&
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              locale={locale}
              onToggleLike={onToggleLike}
              onLoadComments={fetchComments}
              onAddComment={addComment}
            />
          ))}

      {!loading && !error && hasMore && posts.length > 0 && (
        <div className="pt-4">
          <div ref={loadMoreTriggerRef} className="h-2 w-full" aria-hidden />
          <div className="flex justify-center pt-3">
            <span className="rounded-xl border border-white/10 bg-white/5 px-6 py-2 text-sm font-semibold text-slate-300">
              {loadingMore ? t("community.loading_more") : t("community.load_more")}
            </span>
          </div>
        </div>
      )}
    </CommunityShell>
  );
}
