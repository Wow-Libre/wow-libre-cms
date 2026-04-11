"use client";

import { useUserContext } from "@/context/UserContext";
import { webProps } from "@/constants/configs";
import { InternalServerError } from "@/dto/generic";
import { useTranslation } from "react-i18next";
import { useCallback, useRef, useState } from "react";
import {
  requestMediaPresign,
  uploadFileToPresignedUrl,
} from "../api/socialFeedApi";
import { SOCIAL_FREE_POSTS_PER_24H, SOCIAL_MEDIA_MAX_BYTES } from "../constants";
import {
  communityBtnPrimary,
  communityCard,
  communityInput,
  communityMuted,
  communityPanel,
  communityRingAvatar,
} from "../constants/communityStyles";
import { IconPhoto } from "./CommunityIcons";

type CreatePostComposerProps = {
  token: string;
  /** `null` mientras se comprueba la suscripción; solo se muestra el aviso en cuenta gratuita. */
  hasActiveSubscription: boolean | null;
  onPostCreated: (content: string, mediaUrls: string[]) => Promise<void>;
};

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,video/mp4";

const MEDIA_INPUT_ID = "community-feed-media-input";

export function CreatePostComposer({
  token,
  hasActiveSubscription,
  onPostCreated,
}: CreatePostComposerProps) {
  const { t } = useTranslation();
  const { user } = useUserContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fileCount, setFileCount] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const syncFileCount = useCallback(() => {
    const n = fileInputRef.current?.files?.length ?? 0;
    setFileCount(n);
  }, []);

  const uploadMedia = useCallback(
    async (file: File): Promise<string | null> => {
      if (file.size > SOCIAL_MEDIA_MAX_BYTES) {
        throw new Error(t("community.composer.file_too_large"));
      }
      const presign = await requestMediaPresign(token, {
        filename: file.name,
        content_type: file.type || "application/octet-stream",
        byte_size: file.size,
      });
      await uploadFileToPresignedUrl(
        presign.upload_url,
        file,
        file.type || "application/octet-stream"
      );
      return presign.public_url;
    },
    [token, t]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    const fileInput = fileInputRef.current;
    const files = fileInput?.files ? Array.from(fileInput.files) : [];

    if (!trimmed && files.length === 0) {
      return;
    }

    setSubmitting(true);
    setUploadError(null);
    const mediaUrls: string[] = [];
    try {
      for (const file of files) {
        try {
          const url = await uploadMedia(file);
          if (url) mediaUrls.push(url);
        } catch (err: unknown) {
          if (err instanceof InternalServerError && err.statusCode === 404) {
            setUploadError(t("community.composer.upload_unavailable"));
            console.error("Presign not available:", err);
            continue;
          }
          throw err;
        }
      }

      const content = trimmed || (mediaUrls.length > 0 ? " " : "");
      if (!trimmed && mediaUrls.length === 0) {
        setUploadError(t("community.composer.nothing_uploaded"));
        return;
      }

      try {
        await onPostCreated(content, mediaUrls);
      } catch (postErr: unknown) {
        if (
          postErr instanceof InternalServerError &&
          postErr.statusCode === 429
        ) {
          setUploadError(
            t("community.composer.daily_limit", {
              count: SOCIAL_FREE_POSTS_PER_24H,
            })
          );
          console.error(postErr);
          return;
        }
        const raw = postErr instanceof Error ? postErr.message : "";
        if (
          raw === "Failed to fetch" ||
          raw.includes("Failed to fetch") ||
          raw.includes("services are not available")
        ) {
          setUploadError(t("community.composer.network_error"));
        } else {
          setUploadError(t("community.composer.post_failed"));
        }
        console.error(postErr);
        return;
      }

      setText("");
      setFileCount(0);
      setExpanded(false);
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : t("community.composer.error");
      if (
        message === "Failed to fetch" ||
        message.includes("Failed to fetch")
      ) {
        setUploadError(t("community.composer.network_error"));
      } else {
        setUploadError(message);
      }
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const displayName =
    user.first_name || user.last_name
      ? `${user.first_name} ${user.last_name}`.trim()
      : user.username;

  const showComposerBody = expanded || text.length > 0 || fileCount > 0;

  const onFilesChange = () => {
    syncFileCount();
    setExpanded(true);
  };

  const resetComposer = () => {
    setExpanded(false);
    setText("");
    setFileCount(0);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`overflow-hidden ${communityCard}`}>
      <input
        ref={fileInputRef}
        id={MEDIA_INPUT_ID}
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        onChange={onFilesChange}
      />

      {!showComposerBody ? (
        <>
          <div className="flex items-center gap-3 p-5 sm:gap-4 sm:p-6">
            <img
              src={user.avatar || webProps.logo}
              alt=""
              className={`h-12 w-12 shrink-0 rounded-full object-cover sm:h-14 sm:w-14 ${communityRingAvatar}`}
            />
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className={`min-h-[52px] flex-1 rounded-2xl border border-white/10 px-5 text-left text-base transition ${communityInput} hover:border-white/20 hover:bg-midnight/90 focus:outline-none focus:ring-2 focus:ring-gaming-primary-light/40 sm:text-lg`}
            >
              {t("community.composer.placeholder_short")}
            </button>
          </div>
          <div className={communityPanel}>
            <label
              htmlFor={MEDIA_INPUT_ID}
              className="flex w-full cursor-pointer items-center justify-center gap-2.5 py-4 text-base font-medium text-slate-300 transition hover:bg-white/[0.04] sm:py-4"
            >
              <IconPhoto className="h-6 w-6 text-emerald-400/90" />
              <span>{t("community.composer.photo")}</span>
            </label>
          </div>
        </>
      ) : null}

      {showComposerBody && (
        <div className={`${communityPanel} p-5 sm:p-6`}>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <img
                src={user.avatar || webProps.logo}
                alt=""
                className={`h-12 w-12 shrink-0 rounded-full object-cover sm:h-14 sm:w-14 ${communityRingAvatar}`}
              />
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-white sm:text-lg">
                  {t("community.composer.card_title")}
                </p>
                <p className={`truncate text-sm ${communityMuted}`}>{displayName}</p>
              </div>
            </div>
            {fileCount > 0 && (
              <span className="shrink-0 text-sm font-medium text-gaming-primary-light sm:text-base">
                {t("community.composer.files_ready", { count: fileCount })}
              </span>
            )}
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("community.composer.placeholder")}
            rows={6}
            className={`w-full resize-none rounded-xl px-4 py-3.5 text-base leading-relaxed shadow-inner focus:outline-none focus:ring-2 focus:ring-gaming-primary-light/40 sm:min-h-[10rem] sm:text-lg ${communityInput}`}
            autoFocus
          />

          {uploadError && (
            <div
              className="mt-4 rounded-xl border border-amber-500/30 bg-amber-950/40 px-4 py-3.5 text-base text-amber-100"
              role="alert"
            >
              {uploadError}
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2.5 rounded-xl px-2 py-2.5 text-base font-medium text-emerald-400/95 transition hover:bg-white/5 sm:text-lg"
            >
              <IconPhoto className="h-6 w-6 shrink-0" />
              {t("community.composer.add_more_media")}
            </button>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button
                type="button"
                onClick={resetComposer}
                className="rounded-xl px-5 py-2.5 text-base font-medium text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
              >
                {t("community.composer.cancel")}
              </button>
              <button
                type="submit"
                disabled={submitting || (!text.trim() && fileCount === 0)}
                className={`${communityBtnPrimary} min-w-[7.5rem] disabled:cursor-not-allowed disabled:opacity-40`}
              >
                {submitting ? t("community.composer.posting") : t("community.composer.publish")}
              </button>
            </div>
          </div>
          <p className={`mt-4 text-center text-sm leading-relaxed sm:text-left ${communityMuted}`}>
            {t("community.composer.hint_media")}
          </p>
          {hasActiveSubscription === false && (
            <p
              className={`mt-2 text-center text-xs leading-relaxed text-slate-500/90 sm:text-left`}
            >
              {t("community.composer.free_tier_hint", {
                count: SOCIAL_FREE_POSTS_PER_24H,
              })}
            </p>
          )}
        </div>
      )}
    </form>
  );
}
