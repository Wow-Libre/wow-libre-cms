"use client";

import React, { useState, useEffect } from "react";
import {
  createPlatform,
  getPlatforms,
  updatePlatform,
  deletePlatform,
} from "@/api/voting";
import { VotingPlatforms } from "@/model/VotingPlatforms";
import { dashboardSwal as Swal } from "@/components/dashboard/dashboardSwal";
import { DashboardSection } from "../layout";
import { DashboardModalShell } from "../DashboardModalShell";
import { DASHBOARD_PALETTE } from "../styles/dashboardPalette";
import {
  FaExternalLinkAlt,
  FaImage,
  FaLink,
  FaPlus,
  FaServer,
  FaTrashAlt,
  FaVoteYea,
} from "react-icons/fa";

interface VoteEntry {
  name: string;
  url: string;
  ip: string;
  image: string;
}

interface VotingProps {
  token: string;
  t: (key: string, options?: Record<string, string | number>) => string;
}

const EMPTY_FORM: VoteEntry = { name: "", url: "", ip: "", image: "" };

const VotesDashboard: React.FC<VotingProps> = ({ token, t }) => {
  const [partners, setPartners] = useState<VotingPlatforms[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<VoteEntry>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [imagePreviewFailed, setImagePreviewFailed] = useState(false);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const data = await getPlatforms(token || null);
        setPartners(data);
      } catch (error: any) {
        Swal.fire({
          icon: "warning",
          title: t("votes-dashboard.alerts.fetch-error-title"),
          text: error.message,
          color: "white",
          background: "#0B1218",
          timer: 4500,
        });
      }
    };
    fetchPartners();
  }, [token]);

  useEffect(() => {
    setImagePreviewFailed(false);
  }, [formData.image]);

  const refreshPartners = async () => {
    const updated = await getPlatforms(token);
    setPartners(updated);
  };

  const openCreateModal = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setImagePreviewFailed(false);
    setModalOpen(true);
  };

  const openEditModal = (partner: VotingPlatforms) => {
    setFormData({
      name: partner.name,
      url: partner.postback_url,
      ip: "",
      image: partner.img_url,
    });
    setEditingId(partner.id);
    setImagePreviewFailed(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setImagePreviewFailed(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "name") {
      const selected = partners.find((p) => p.name === value);
      if (selected) {
        setFormData((prev) => ({
          ...prev,
          name: selected.name,
          url: selected.postback_url,
          image: selected.img_url,
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (editingId !== null) {
        await updatePlatform(
          token,
          editingId,
          formData.name,
          formData.image,
          formData.url,
          formData.ip
        );
      } else {
        await createPlatform(
          token,
          formData.name,
          formData.image,
          formData.url,
          formData.ip
        );
      }

      closeModal();
      await refreshPartners();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: t("votes-dashboard.alerts.save-error-title"),
        text: t("votes-dashboard.alerts.save-error-message"),
      });
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: t("votes-dashboard.alerts.delete-confirm-title"),
      text: t("votes-dashboard.alerts.delete-confirm-message"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("votes-dashboard.alerts.delete-confirm-yes"),
      cancelButtonText: t("votes-dashboard.alerts.delete-confirm-no"),
    });

    if (!result.isConfirmed) return;

    try {
      await deletePlatform(token, id);
      await refreshPartners();
      if (editingId === id) closeModal();
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: t("votes-dashboard.alerts.delete-error-title"),
        text: t("votes-dashboard.alerts.delete-error-message"),
      });
    }
  };

  const previewUrl = formData.image.trim();
  const showPreview = previewUrl.length > 0 && !imagePreviewFailed;
  const isEditing = editingId !== null;

  const renderLabel = (
    Icon: React.ComponentType<{ className?: string }>,
    text: string
  ) => (
    <span className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-300">
      <Icon className="h-4 w-4 text-indigo-300/90" aria-hidden />
      <span>{text}</span>
    </span>
  );

  return (
    <div className="space-y-6">
      {/* Cabecera: título + descripción + contador + CTA */}
      <section
        className={`flex flex-col gap-4 rounded-xl ${DASHBOARD_PALETTE.card} p-5 shadow-lg backdrop-blur-sm sm:p-6 lg:flex-row lg:items-center lg:justify-between`}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-300">
              <FaVoteYea className="h-4 w-4" aria-hidden />
            </div>
            <h1 className={`text-base font-semibold ${DASHBOARD_PALETTE.text} sm:text-lg`}>
              {t("votes-dashboard.title-create")}
            </h1>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-200">
              <span
                className="h-1.5 w-1.5 rounded-full bg-indigo-300"
                aria-hidden
              />
              {t("votes-dashboard.list.count", { count: partners.length })}
            </span>
          </div>
          <p className={`mt-2 text-sm ${DASHBOARD_PALETTE.textMuted}`}>
            {t("votes-dashboard.header.subtitle")}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className={`inline-flex items-center justify-center gap-2 ${DASHBOARD_PALETTE.btnPrimary} shrink-0 px-5 py-2.5 text-sm`}
        >
          <FaPlus className="h-4 w-4" aria-hidden />
          <span>{t("votes-dashboard.header.add-platform")}</span>
        </button>
      </section>

      {/* Tarjetas de plataformas */}
      <DashboardSection title={t("votes-dashboard.list.title")}>
        {partners.length === 0 ? (
          <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-slate-700/70 bg-slate-900/40 px-6 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800/80 text-indigo-300 ring-1 ring-slate-700/60">
              <FaVoteYea className="h-6 w-6" aria-hidden />
            </div>
            <div className="space-y-1">
              <p className={`text-sm font-medium ${DASHBOARD_PALETTE.text}`}>
                {t("votes-dashboard.list.empty-title")}
              </p>
              <p className="text-sm text-slate-400">
                {t("votes-dashboard.list.empty")}
              </p>
            </div>
            <button
              type="button"
              onClick={openCreateModal}
              className={`inline-flex items-center justify-center gap-2 ${DASHBOARD_PALETTE.btnPrimary} mt-1 px-4 py-2 text-sm`}
            >
              <FaPlus className="h-3.5 w-3.5" aria-hidden />
              <span>{t("votes-dashboard.header.add-platform")}</span>
            </button>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {partners.map((partner) => (
              <li
                key={partner.id}
                className={`group relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/60 p-4 transition-all hover:-translate-y-0.5 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/10`}
              >
                <div className="flex items-start gap-3">
                  <img
                    src={partner.img_url}
                    alt={partner.name}
                    className="h-16 w-16 shrink-0 rounded-xl object-cover ring-1 ring-slate-700 transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-sm font-semibold ${DASHBOARD_PALETTE.text}`}
                      title={partner.name}
                    >
                      {partner.name}
                    </p>
                    <a
                      href={partner.postback_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex max-w-full items-center gap-1 truncate text-xs text-slate-400 transition-colors hover:text-indigo-300"
                      title={partner.postback_url}
                    >
                      <FaLink className="h-3 w-3 shrink-0" aria-hidden />
                      <span className="truncate">
                        {partner.postback_url.replace(/^https?:\/\//, "")}
                      </span>
                      <FaExternalLinkAlt
                        className="h-2.5 w-2.5 shrink-0 opacity-70"
                        aria-hidden
                      />
                    </a>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-700/40 pt-3">
                  <a
                    href={partner.postback_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={t("votes-dashboard.list.open-url")}
                    aria-label={t("votes-dashboard.list.open-url")}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-600/60 text-slate-300 transition-colors hover:border-indigo-500/60 hover:text-indigo-200"
                  >
                    <FaExternalLinkAlt className="h-3.5 w-3.5" aria-hidden />
                  </a>
                  <button
                    type="button"
                    onClick={() => openEditModal(partner)}
                    className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium ${DASHBOARD_PALETTE.accentBorder} ${DASHBOARD_PALETTE.accent} transition-colors hover:bg-indigo-500/10`}
                  >
                    {t("votes-dashboard.list.edit")}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(partner.id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/40 bg-red-500/10 text-red-300 transition-colors hover:bg-red-500/20"
                    aria-label={t("votes-dashboard.list.delete")}
                    title={t("votes-dashboard.list.delete")}
                  >
                    <FaTrashAlt className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </DashboardSection>

      {/* Modal de crear / editar */}
      <DashboardModalShell
        open={modalOpen}
        onClose={closeModal}
        title={
          isEditing
            ? t("votes-dashboard.modal.edit-title")
            : t("votes-dashboard.modal.create-title")
        }
        subtitle={
          isEditing
            ? t("votes-dashboard.modal.edit-subtitle")
            : t("votes-dashboard.modal.create-subtitle")
        }
        accent="cyan"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="vote-name" className="block">
              {renderLabel(FaVoteYea, t("votes-dashboard.form.name-label"))}
            </label>
            <select
              id="vote-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={DASHBOARD_PALETTE.input}
              required
            >
              <option value="">
                {t("votes-dashboard.form.name-placeholder")}
              </option>
              <option value="TOPG">topg.org</option>
            </select>
            <p className="mt-1 text-xs text-slate-400">
              {t("votes-dashboard.form.name-hint")}
            </p>
          </div>

          <div>
            <label htmlFor="vote-url" className="block">
              {renderLabel(FaLink, t("votes-dashboard.form.url-label"))}
            </label>
            <input
              id="vote-url"
              type="url"
              name="url"
              maxLength={80}
              placeholder={t("votes-dashboard.form.url-placeholder")}
              value={formData.url}
              onChange={handleChange}
              className={DASHBOARD_PALETTE.input}
              required
            />
          </div>

          <div>
            <label htmlFor="vote-ip" className="block">
              {renderLabel(FaServer, t("votes-dashboard.form.ip-label"))}
            </label>
            <input
              id="vote-ip"
              type="text"
              name="ip"
              placeholder={t("votes-dashboard.form.ip-placeholder")}
              maxLength={80}
              value={formData.ip}
              onChange={handleChange}
              className={DASHBOARD_PALETTE.input}
            />
          </div>

          <div>
            <label htmlFor="vote-image" className="block">
              {renderLabel(FaImage, t("votes-dashboard.form.image-label"))}
            </label>
            <input
              id="vote-image"
              type="url"
              name="image"
              placeholder={t("votes-dashboard.form.image-placeholder")}
              maxLength={80}
              value={formData.image}
              onChange={handleChange}
              className={DASHBOARD_PALETTE.input}
              required
            />

            {showPreview && (
              <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-700/60 bg-slate-800/40 p-3">
                <img
                  src={previewUrl}
                  alt={t("votes-dashboard.form.image-preview-alt")}
                  onError={() => setImagePreviewFailed(true)}
                  className="h-14 w-14 shrink-0 rounded-lg object-cover ring-1 ring-slate-700"
                  loading="lazy"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {t("votes-dashboard.form.image-preview-label")}
                  </p>
                  <p className="truncate text-xs text-slate-300">
                    {previewUrl}
                  </p>
                </div>
              </div>
            )}
            {!showPreview && previewUrl.length === 0 && (
              <p className="mt-1 text-xs text-slate-500">
                {t("votes-dashboard.form.image-hint")}
              </p>
            )}
            {!showPreview && imagePreviewFailed && (
              <p className="mt-1 text-xs text-red-300/90">
                {t("votes-dashboard.form.image-preview-error")}
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-700/50 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-600/60 bg-transparent px-5 py-3 text-sm font-medium text-slate-300 transition-colors hover:border-slate-500 hover:bg-slate-700/40"
            >
              {t("votes-dashboard.modal.cancel")}
            </button>
            <button
              type="submit"
              className={`inline-flex items-center justify-center gap-2 ${DASHBOARD_PALETTE.btnPrimary} sm:px-6`}
            >
              <FaVoteYea className="h-4 w-4" aria-hidden />
              <span>
                {isEditing
                  ? t("votes-dashboard.form.submit-edit")
                  : t("votes-dashboard.form.submit-create")}
              </span>
            </button>
          </div>
        </form>
      </DashboardModalShell>
    </div>
  );
};

export default VotesDashboard;
