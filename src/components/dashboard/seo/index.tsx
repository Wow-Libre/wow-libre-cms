"use client";
import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { SEOConfig, GlobalSEO, PageSEO } from "@/types/seo";

interface SEODashboardProps {
  token: string;
}

type EditablePage = PageSEO & { schemaJsonText?: string };

const emptyPage = (): EditablePage => ({
  slug: "",
  title: "",
  description: "",
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  schemaJsonText: "",
});

const defaultGlobal: GlobalSEO = {
  siteName: "",
  title: "",
  description: "",
  canonicalBase: "",
  defaultLocale: "es",
  locales: ["es"],
  defaultOgImage: "",
  twitterHandle: "",
  robots: { index: true, follow: true },
  sitemapEnabled: true,
  robotsTxt: "",
  verification: {},
};

const SEODashboard: React.FC<SEODashboardProps> = ({ token }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [global, setGlobal] = useState<GlobalSEO>(defaultGlobal);
  const [localesText, setLocalesText] = useState("es");
  const [pages, setPages] = useState<EditablePage[]>([emptyPage()]);

  const isValid = useMemo(() => {
    return global.canonicalBase.startsWith("http") && global.title.length > 0;
  }, [global]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/seo", { cache: "no-store" });
        if (!res.ok) throw new Error("No se pudo cargar el SEO.");
        const data = (await res.json()) as SEOConfig;
        setGlobal({ ...defaultGlobal, ...data.global });
        setLocalesText((data.global.locales || []).join(", "));
        setPages(
          (data.pages || []).map((p) => ({
            ...p,
            schemaJsonText: p.schemaJson ? JSON.stringify(p.schemaJson, null, 2) : "",
          })) || [emptyPage()]
        );
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo cargar la configuración SEO.",
          color: "white",
          background: "#0B1218",
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleGlobalChange = (
    key: keyof GlobalSEO,
    value: string | boolean
  ) => {
    setGlobal((prev) => ({ ...prev, [key]: value }));
  };

  const handleRobotsChange = (key: "index" | "follow", value: boolean) => {
    setGlobal((prev) => ({
      ...prev,
      robots: {
        ...prev.robots,
        [key]: value,
      },
    }));
  };

  const handlePageChange = (
    index: number,
    key: keyof EditablePage,
    value: string | boolean
  ) => {
    setPages((prev) => {
      const next = [...prev];
      // @ts-expect-error dynamic assignment
      next[index][key] = value;
      return next;
    });
  };

  const addPage = () => setPages((prev) => [...prev, emptyPage()]);

  const removePage = (index: number) => {
    setPages((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const parsedPages: PageSEO[] = pages.map((page) => {
        const cloned: PageSEO = { ...page };
        delete (cloned as any).schemaJsonText;
        if (page.schemaJsonText) {
          try {
            cloned.schemaJson = JSON.parse(page.schemaJsonText);
          } catch (err) {
            throw new Error(`JSON inválido en la página ${page.slug || "(sin slug)"}`);
          }
        } else {
          delete cloned.schemaJson;
        }
        if (!cloned.slug) cloned.slug = "/";
        return cloned;
      });

      const payload: SEOConfig = {
        global: {
          ...global,
          locales: localesText
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        },
        pages: parsedPages,
      };

      const res = await fetch("/api/seo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("No se pudo guardar el SEO.");

      Swal.fire({
        icon: "success",
        title: "SEO guardado",
        text: "Los cambios se aplicaron correctamente.",
        color: "white",
        background: "#0B1218",
        timer: 3500,
      });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.message || "No se pudo guardar el SEO.",
        color: "white",
        background: "#0B1218",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-24 text-white">
        <div className="animate-pulse text-lg">Cargando configuración SEO...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-white">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">SEO</h1>
        <p className="text-slate-300 max-w-2xl">
          Configura el SEO global, la página principal y las páginas internas. Los cambios se guardan en la configuración del sitio.
        </p>
      </header>

      <section className="bg-slate-900/60 border border-slate-700/60 rounded-xl p-6 space-y-4 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Global</h2>
          <span className="text-sm text-slate-400">Base para todas las páginas</span>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-2 text-sm">
            <span>Site name</span>
            <input
              className="bg-slate-800 border border-slate-700 rounded px-3 py-2"
              value={global.siteName}
              onChange={(e) => handleGlobalChange("siteName", e.target.value)}
              placeholder="WoW Libre"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span>Título por defecto</span>
            <input
              className="bg-slate-800 border border-slate-700 rounded px-3 py-2"
              value={global.title}
              onChange={(e) => handleGlobalChange("title", e.target.value)}
              placeholder="Título del sitio"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm md:col-span-2">
            <span>Descripción</span>
            <textarea
              className="bg-slate-800 border border-slate-700 rounded px-3 py-2"
              value={global.description}
              onChange={(e) => handleGlobalChange("description", e.target.value)}
              rows={3}
              placeholder="Descripción general del sitio"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span>Canonical base</span>
            <input
              className="bg-slate-800 border border-slate-700 rounded px-3 py-2"
              value={global.canonicalBase}
              onChange={(e) => handleGlobalChange("canonicalBase", e.target.value)}
              placeholder="https://tu-dominio.com"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span>Locale por defecto</span>
            <input
              className="bg-slate-800 border border-slate-700 rounded px-3 py-2"
              value={global.defaultLocale}
              onChange={(e) => handleGlobalChange("defaultLocale", e.target.value)}
              placeholder="es"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span>Locales (separados por coma)</span>
            <input
              className="bg-slate-800 border border-slate-700 rounded px-3 py-2"
              value={localesText}
              onChange={(e) => setLocalesText(e.target.value)}
              placeholder="es, en, pt"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span>Imagen OG por defecto</span>
            <input
              className="bg-slate-800 border border-slate-700 rounded px-3 py-2"
              value={global.defaultOgImage}
              onChange={(e) => handleGlobalChange("defaultOgImage", e.target.value)}
              placeholder="https://.../og.png"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span>Twitter handle</span>
            <input
              className="bg-slate-800 border border-slate-700 rounded px-3 py-2"
              value={global.twitterHandle || ""}
              onChange={(e) => handleGlobalChange("twitterHandle", e.target.value)}
              placeholder="@wowlibre"
            />
          </label>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={global.robots.index}
                onChange={(e) => handleRobotsChange("index", e.target.checked)}
              />
              <span>Index</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={global.robots.follow}
                onChange={(e) => handleRobotsChange("follow", e.target.checked)}
              />
              <span>Follow</span>
            </label>
          </div>
          <label className="flex flex-col gap-2 text-sm">
            <span>Google verification</span>
            <input
              className="bg-slate-800 border border-slate-700 rounded px-3 py-2"
              value={global.verification?.google || ""}
              onChange={(e) =>
                setGlobal((prev) => ({
                  ...prev,
                  verification: { ...prev.verification, google: e.target.value },
                }))
              }
              placeholder="token de verificación"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span>Bing verification</span>
            <input
              className="bg-slate-800 border border-slate-700 rounded px-3 py-2"
              value={global.verification?.bing || ""}
              onChange={(e) =>
                setGlobal((prev) => ({
                  ...prev,
                  verification: { ...prev.verification, bing: e.target.value },
                }))
              }
              placeholder="token de verificación"
            />
          </label>
        </div>
        <label className="flex flex-col gap-2 text-sm">
          <span>robots.txt personalizado</span>
          <textarea
            className="bg-slate-800 border border-slate-700 rounded px-3 py-2"
            rows={4}
            value={global.robotsTxt || ""}
            onChange={(e) => handleGlobalChange("robotsTxt", e.target.value)}
            placeholder={"User-agent: *\nAllow: /\nSitemap: https://tu-dominio.com/sitemap.xml"}
          />
        </label>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Páginas</h2>
          <button
            onClick={addPage}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm"
          >
            Añadir página
          </button>
        </div>
        <div className="grid gap-6">
          {pages.map((page, index) => (
            <div
              key={index}
              className="bg-slate-900/60 border border-slate-700/60 rounded-xl p-5 space-y-4 shadow"
            >
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">Slug: {page.slug || "(nuevo)"}</div>
                <button
                  onClick={() => removePage(index)}
                  className="text-sm text-red-300 hover:text-red-200"
                  disabled={pages.length === 1}
                >
                  Eliminar
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-2 text-sm">
                  <span>Slug</span>
                  <input
                    className="bg-slate-800 border border-slate-700 rounded px-3 py-2"
                    value={page.slug}
                    onChange={(e) => handlePageChange(index, "slug", e.target.value)}
                    placeholder="/, /news, /store"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm">
                  <span>Título</span>
                  <input
                    className="bg-slate-800 border border-slate-700 rounded px-3 py-2"
                    value={page.title || ""}
                    onChange={(e) => handlePageChange(index, "title", e.target.value)}
                    placeholder="Título de la página"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm md:col-span-2">
                  <span>Descripción</span>
                  <textarea
                    className="bg-slate-800 border border-slate-700 rounded px-3 py-2"
                    value={page.description || ""}
                    onChange={(e) => handlePageChange(index, "description", e.target.value)}
                    rows={2}
                    placeholder="Descripción corta"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm">
                  <span>Canonical</span>
                  <input
                    className="bg-slate-800 border border-slate-700 rounded px-3 py-2"
                    value={page.canonical || ""}
                    onChange={(e) => handlePageChange(index, "canonical", e.target.value)}
                    placeholder="https://tu-dominio.com/slug"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm">
                  <span>OG título</span>
                  <input
                    className="bg-slate-800 border border-slate-700 rounded px-3 py-2"
                    value={page.ogTitle || ""}
                    onChange={(e) => handlePageChange(index, "ogTitle", e.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm">
                  <span>OG descripción</span>
                  <input
                    className="bg-slate-800 border border-slate-700 rounded px-3 py-2"
                    value={page.ogDescription || ""}
                    onChange={(e) => handlePageChange(index, "ogDescription", e.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm">
                  <span>OG imagen</span>
                  <input
                    className="bg-slate-800 border border-slate-700 rounded px-3 py-2"
                    value={page.ogImage || ""}
                    onChange={(e) => handlePageChange(index, "ogImage", e.target.value)}
                    placeholder="https://.../og.png"
                  />
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!!page.noindex}
                    onChange={(e) => handlePageChange(index, "noindex", e.target.checked)}
                  />
                  <span>No index</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!!page.nofollow}
                    onChange={(e) => handlePageChange(index, "nofollow", e.target.checked)}
                  />
                  <span>No follow</span>
                </label>
              </div>
              <label className="flex flex-col gap-2 text-sm">
                <span>Schema (JSON-LD)</span>
                <textarea
                  className="bg-slate-800 border border-slate-700 rounded px-3 py-2 font-mono text-xs"
                  rows={5}
                  value={page.schemaJsonText || ""}
                  onChange={(e) => handlePageChange(index, "schemaJsonText", e.target.value)}
                  placeholder='{"@context":"https://schema.org","@type":"WebSite"}'
                />
              </label>
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={!isValid || saving}
          className={`px-6 py-3 rounded-lg text-white font-semibold transition-all ${
            isValid && !saving
              ? "bg-green-600 hover:bg-green-500"
              : "bg-slate-700 cursor-not-allowed"
          }`}
        >
          {saving ? "Guardando..." : "Guardar SEO"}
        </button>
        {!isValid && (
          <span className="text-sm text-red-300">
            Completa al menos el título y la canonical base (http/https).
          </span>
        )}
      </div>
    </div>
  );
};

export default SEODashboard;
