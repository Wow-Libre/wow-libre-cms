"use client";

import { NewsModel } from "@/model/News";
import { useState } from "react";
import { NewsImageUploader } from "./NewsImageUploader";
import { NewsPreview } from "./NewsPreview";

export type NewsFormState = {
  title: string;
  sub_title: string;
  img_url: string;
  author: string;
};

export const EMPTY_NEWS_FORM: NewsFormState = {
  title: "",
  sub_title: "",
  img_url: "",
  author: "",
};

export function NewsEditor({
  state,
  onChange,
  token,
  selectedId,
  onSubmit,
  onCancel,
  onDelete,
  submitting,
}: {
  state: NewsFormState;
  onChange: (next: NewsFormState) => void;
  token: string;
  selectedId: number | null;
  onSubmit: () => void;
  onCancel: () => void;
  onDelete: () => void;
  submitting: boolean;
}) {
  const [errors, setErrors] = useState<Partial<Record<keyof NewsFormState, string>>>({});

  const setField = <K extends keyof NewsFormState>(key: K, value: NewsFormState[K]) => {
    onChange({ ...state, [key]: value });
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof NewsFormState, string>> = {};
    if (!state.title.trim()) next.title = "Título obligatorio";
    if (!state.sub_title.trim()) next.sub_title = "Subtítulo obligatorio";
    if (!state.author.trim()) next.author = "Autor obligatorio";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const isEditing = selectedId !== null;
  const previewNews: NewsModel = {
    id: selectedId ?? 0,
    title: state.title,
    sub_title: state.sub_title,
    img_url: state.img_url,
    author: state.author,
    created_at: new Date().toISOString(),
  };

  return (
    <aside
      aria-label="Editor de noticia"
      className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/60"
    >
      <header className="flex items-center justify-between gap-2 border-b border-slate-700/50 px-4 py-3">
        <h2 className="text-base font-semibold text-white">
          {isEditing ? `Editar noticia #${selectedId}` : "Nueva noticia"}
        </h2>
        {isEditing && (
          <button
            type="button"
            onClick={onDelete}
            disabled={submitting}
            className="rounded-md p-1.5 text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
            aria-label="Eliminar noticia"
            title="Eliminar"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (validate()) onSubmit();
          }}
        >
          <Field
            label="Título"
            error={errors.title}
            required
            input={
              <input
                type="text"
                value={state.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="Ej: Evento de Halloween este viernes"
                className={inputCls(!!errors.title)}
                maxLength={140}
              />
            }
          />
          <Field
            label="Subtítulo"
            error={errors.sub_title}
            required
            input={
              <input
                type="text"
                value={state.sub_title}
                onChange={(e) => setField("sub_title", e.target.value)}
                placeholder="Resumen que se muestra en la card"
                className={inputCls(!!errors.sub_title)}
                maxLength={240}
              />
            }
          />

          <div>
            <p className="mb-1.5 text-xs font-semibold text-slate-300">
              Imagen <span className="text-slate-500">(opcional)</span>
            </p>
            <NewsImageUploader
              token={token}
              value={state.img_url}
              onChange={(url) => setField("img_url", url)}
              label=""
              context={isEditing ? "news-edit" : "news-new"}
            />
          </div>

          <Field
            label="Autor"
            error={errors.author}
            required
            input={
              <input
                type="text"
                value={state.author}
                onChange={(e) => setField("author", e.target.value)}
                placeholder="Nombre que aparece en la publicación"
                className={inputCls(!!errors.author)}
                maxLength={80}
              />
            }
          />

          <div>
            <p className="mb-1.5 text-xs font-semibold text-slate-300">
              Vista previa
            </p>
            <NewsPreview news={previewNews} />
          </div>
        </form>
      </div>

      <footer className="flex shrink-0 items-center gap-2 border-t border-slate-700/50 bg-slate-900/80 px-4 py-3">
        {isEditing && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="rounded-xl border border-slate-600/60 bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-700 disabled:opacity-50"
          >
            Cancelar
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            if (validate()) onSubmit();
          }}
          disabled={submitting}
          className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-95 disabled:opacity-50"
        >
          {submitting
            ? "Guardando…"
            : isEditing
              ? "Guardar cambios"
              : "Crear noticia"}
        </button>
      </footer>
    </aside>
  );
}

function Field({
  label,
  input,
  error,
  required,
}: {
  label: string;
  input: React.ReactNode;
  error?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-300">
        <span>
          {label}
          {required && <span className="ml-0.5 text-red-400">*</span>}
        </span>
        {error && <span className="text-xs font-normal text-red-400">{error}</span>}
      </label>
      {input}
    </div>
  );
}

function inputCls(error: boolean) {
  return [
    "w-full rounded-xl border px-3 py-2 text-sm text-white outline-none transition-colors",
    error
      ? "border-red-500/50 bg-slate-800/50 focus:border-red-400 focus:ring-2 focus:ring-red-400/20"
      : "border-slate-600/50 bg-slate-800/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20",
  ].join(" ");
}

export default NewsEditor;
