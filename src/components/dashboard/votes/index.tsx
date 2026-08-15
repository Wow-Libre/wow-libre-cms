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
import { DashboardImageUploader } from "../image-uploader/DashboardImageUploader";
import { DASHBOARD_PALETTE } from "../styles/dashboardPalette";
import { uploadVotesImage } from "@/lib/upload/votesImageUpload";
import {
  FaExternalLinkAlt,
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

  const refreshPartners = async () => {
    const updated = await getPlatforms(token);
    setPartners(updated);
  };

  const openCreateModal = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
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
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
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

    if (!formData.image.trim()) {
      Swal.fire({
        icon: "warning",
        title: t("votes-dashboard.alerts.image-required-title"),
        text: t("votes-dashboard.alerts.image-required-message"),
      });
      return;
    }

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

  const isEditing = editingId !== null;

  const renderLabel = (
    Icon: React.ComponentType<{ className?: string }>,
    text: string
  ) => (
    <span className="mb-2 flex items-center gap-2 text-base font-medium text-slate-200">
      <Icon className="h-5 w-5 text-indigo-300/90" aria-hidden />
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
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300">
              <FaVoteYea className="h-5 w-5" aria-hidden />
            </div>
            <h1 className={`text-2xl font-semibold ${DASHBOARD_PALETTE.text} sm:text-3xl`}>
              {t("votes-dashboard.title-create")}
            </h1>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-sm font-semibold text-indigo-200">
              <span
                className="h-2 w-2 rounded-full bg-indigo-300"
                aria-hidden
              />
              {t("votes-dashboard.list.count", { count: partners.length })}
            </span>
          </div>
          <p className={`mt-3 text-base ${DASHBOARD_PALETTE.textMuted}`}>
            {t("votes-dashboard.header.subtitle")}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className={`inline-flex items-center justify-center gap-2 ${DASHBOARD_PALETTE.btnPrimary} shrink-0 px-5 py-3 text-base`}
        >
          <FaPlus className="h-5 w-5" aria-hidden />
          <span>{t("votes-dashboard.header.add-platform")}</span>
        </button>
      </section>

      {/* Tarjetas de plataformas */}
      <DashboardSection
        title={
          <span className={`text-lg font-semibold ${DASHBOARD_PALETTE.text} sm:text-xl`}>
            {t("votes-dashboard.list.title")}
          </span>
        }
      >
        {partners.length === 0 ? (
          <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-slate-700/70 bg-slate-900/40 px-6 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/80 text-indigo-300 ring-1 ring-slate-700/60">
              <FaVoteYea className="h-7 w-7" aria-hidden />
            </div>
            <div className="space-y-1">
              <p className={`text-base font-semibold ${DASHBOARD_PALETTE.text}`}>
                {t("votes-dashboard.list.empty-title")}
              </p>
              <p className="text-base text-slate-400">
                {t("votes-dashboard.list.empty")}
              </p>
            </div>
            <button
              type="button"
              onClick={openCreateModal}
              className={`inline-flex items-center justify-center gap-2 ${DASHBOARD_PALETTE.btnPrimary} mt-1 px-5 py-2.5 text-base`}
            >
              <FaPlus className="h-4 w-4" aria-hidden />
              <span>{t("votes-dashboard.header.add-platform")}</span>
            </button>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {partners.map((partner) => (
              <li
                key={partner.id}
                className={`group relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/60 p-5 transition-all hover:-translate-y-0.5 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/10`}
              >
                <div className="flex items-start gap-4">
                  <img
                    src={partner.img_url}
                    alt={partner.name}
                    className="h-20 w-20 shrink-0 rounded-xl object-cover ring-1 ring-slate-700 transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-base font-semibold ${DASHBOARD_PALETTE.text}`}
                      title={partner.name}
                    >
                      {partner.name}
                    </p>
                    <a
                      href={partner.postback_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex max-w-full items-center gap-1.5 truncate text-sm text-slate-400 transition-colors hover:text-indigo-300"
                      title={partner.postback_url}
                    >
                      <FaLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      <span className="truncate">
                        {partner.postback_url.replace(/^https?:\/\//, "")}
                      </span>
                      <FaExternalLinkAlt
                        className="h-3 w-3 shrink-0 opacity-70"
                        aria-hidden
                      />
                    </a>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-700/40 pt-4">
                  <a
                    href={partner.postback_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={t("votes-dashboard.list.open-url")}
                    aria-label={t("votes-dashboard.list.open-url")}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-600/60 text-slate-300 transition-colors hover:border-indigo-500/60 hover:text-indigo-200"
                  >
                    <FaExternalLinkAlt className="h-4 w-4" aria-hidden />
                  </a>
                  <button
                    type="button"
                    onClick={() => openEditModal(partner)}
                    className={`inline-flex h-10 items-center gap-1.5 rounded-lg border px-4 text-sm font-medium ${DASHBOARD_PALETTE.accentBorder} ${DASHBOARD_PALETTE.accent} transition-colors hover:bg-indigo-500/10`}
                  >
                    {t("votes-dashboard.list.edit")}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(partner.id)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-500/40 bg-red-500/10 text-red-300 transition-colors hover:bg-red-500/20"
                    aria-label={t("votes-dashboard.list.delete")}
                    title={t("votes-dashboard.list.delete")}
                  >
                    <FaTrashAlt className="h-4 w-4" aria-hidden />
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
            <p className="mt-1.5 text-sm text-slate-400">
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
            <DashboardImageUploader
              token={token}
              value={formData.image}
              uploadFn={uploadVotesImage}
              onChange={(url) =>
                setFormData((prev) => ({ ...prev, image: url }))
              }
              label={t("votes-dashboard.form.image-label")}
              hint={t("votes-dashboard.form.image-hint")}
              accent="indigo"
              context={isEditing ? "votes-edit" : "votes-new"}
            />
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-700/50 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-600/60 bg-transparent px-6 py-3 text-base font-medium text-slate-300 transition-colors hover:border-slate-500 hover:bg-slate-700/40"
            >
              {t("votes-dashboard.modal.cancel")}
            </button>
            <button
              type="submit"
              className={`inline-flex items-center justify-center gap-2 ${DASHBOARD_PALETTE.btnPrimary} px-6 py-3 text-base sm:px-7`}
            >
              <FaVoteYea className="h-5 w-5" aria-hidden />
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
