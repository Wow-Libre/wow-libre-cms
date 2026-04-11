"use client";

import { webProps } from "@/constants/configs";
import { useTranslation } from "react-i18next";
import type { SocialComment } from "../types";
import { communityBtnPrimary, communityMuted } from "../constants/communityStyles";
import { formatPostDate } from "../utils/formatPostDate";

type PostCommentsSectionProps = {
  comments: SocialComment[];
  loading: boolean;
  locale: string;
  commentText: string;
  onCommentTextChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  commentSubmitting: boolean;
  /** Contenedor de la lista (scroll en modal vs altura fija en tarjeta) */
  listWrapperClassName: string;
};

export function PostCommentsSection({
  comments,
  loading,
  locale,
  commentText,
  onCommentTextChange,
  onSubmit,
  commentSubmitting,
  listWrapperClassName,
}: PostCommentsSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {loading ? (
        <p className={`py-4 text-center text-base ${communityMuted}`}>
          {t("community.post.loading_comments")}
        </p>
      ) : (
        <div className={listWrapperClassName}>
          <ul className="space-y-4 pr-1">
          {comments.map((c) => (
            <li key={c.id} className="flex gap-3 text-base">
              <img
                src={c.author_avatar || webProps.logo}
                alt=""
                className="mt-0.5 h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-white/10"
              />
              <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md border border-white/5 bg-white/[0.06] px-4 py-3">
                <p className="text-sm font-semibold text-white sm:text-base">{c.author_username}</p>
                <p className="mt-1 text-base text-slate-100 sm:text-lg">{c.content}</p>
                <p className={`mt-1.5 text-xs sm:text-sm ${communityMuted}`}>
                  {formatPostDate(c.created_at, locale)}
                </p>
              </div>
            </li>
          ))}
          {comments.length === 0 && !loading && (
            <li className={`py-3 text-center text-base ${communityMuted}`}>
              {t("community.post.no_comments")}
            </li>
          )}
          </ul>
        </div>
      )}
      <form
        onSubmit={onSubmit}
        className="mt-4 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center"
      >
        <input
          type="text"
          value={commentText}
          onChange={(e) => onCommentTextChange(e.target.value)}
          placeholder={t("community.post.comment_placeholder")}
          className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-midnight/80 px-5 py-3.5 text-base text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-gaming-primary-light/40"
        />
        <button
          type="submit"
          disabled={commentSubmitting || !commentText.trim()}
          className={`${communityBtnPrimary} w-full shrink-0 sm:w-auto disabled:opacity-40`}
        >
          {t("community.post.send")}
        </button>
      </form>
    </div>
  );
}
