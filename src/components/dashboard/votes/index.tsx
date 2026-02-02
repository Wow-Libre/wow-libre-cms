"use client";

import React, { useState, useEffect } from "react";
import {
  createPlatform,
  getPlatforms,
  updatePlatform,
  deletePlatform,
} from "@/api/voting";
import { VotingPlatforms } from "@/model/VotingPlatforms";
import Swal from "sweetalert2";
import { DashboardSection } from "../layout";
import { DASHBOARD_PALETTE } from "../styles/dashboardPalette";

interface VoteEntry {
  name: string;
  url: string;
  ip: string;
  image: string;
}

interface VotingProps {
  token: string;
  t: (key: string) => string;
}

const VotesDashboard: React.FC<VotingProps> = ({ token, t }) => {
  const [formData, setFormData] = useState<VoteEntry>({
    name: "",
    url: "",
    ip: "",
    image: "",
  });
  const [partners, setPartners] = useState<VotingPlatforms[]>([]);
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

      setFormData({ name: "", url: "", ip: "", image: "" });
      setEditingId(null);
      const updated = await getPlatforms(token);
      setPartners(updated);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: t("votes-dashboard.alerts.save-error-title"),
        text: t("votes-dashboard.alerts.save-error-message"),
      });
    }
  };

  const handleEdit = (partner: VotingPlatforms) => {
    setFormData({
      name: partner.name,
      url: partner.postback_url,
      ip: "",
      image: partner.img_url,
    });
    setEditingId(partner.id);
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
      const updated = await getPlatforms(token);
      setPartners(updated);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: t("votes-dashboard.alerts.delete-error-title"),
        text: t("votes-dashboard.alerts.delete-error-message"),
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8 lg:flex-row">
      {/* Formulario */}
      <div className="w-full shrink-0 lg:max-w-[32rem]">
        <DashboardSection
          title={
            editingId
              ? t("votes-dashboard.title-edit")
              : t("votes-dashboard.title-create")
          }
        >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={`mb-1.5 block text-sm font-medium ${DASHBOARD_PALETTE.label}`}>
              {t("votes-dashboard.form.name-label")}
            </label>
            <select
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
          </div>

          <div>
            <label className={`mb-1.5 block text-sm font-medium ${DASHBOARD_PALETTE.label}`}>
              {t("votes-dashboard.form.url-label")}
            </label>
            <input
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
            <label className={`mb-1.5 block text-sm font-medium ${DASHBOARD_PALETTE.label}`}>
              {t("votes-dashboard.form.ip-label")}
            </label>
            <input
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
            <label className={`mb-1.5 block text-sm font-medium ${DASHBOARD_PALETTE.label}`}>
              {t("votes-dashboard.form.image-label")}
            </label>
            <input
              type="url"
              name="image"
              placeholder={t("votes-dashboard.form.image-placeholder")}
              maxLength={80}
              value={formData.image}
              onChange={handleChange}
              className={DASHBOARD_PALETTE.input}
              required
            />
          </div>

          <button type="submit" className={`w-full ${DASHBOARD_PALETTE.btnPrimary}`}>
            {editingId
              ? t("votes-dashboard.form.submit-edit")
              : t("votes-dashboard.form.submit-create")}
          </button>
        </form>
        </DashboardSection>
      </div>

      {/* Lista de plataformas */}
      <div className="min-w-0 flex-1">
        <DashboardSection title={t("votes-dashboard.list.title")}>
        {partners.length === 0 ? (
          <p className={`py-8 text-center ${DASHBOARD_PALETTE.textMuted}`}>
            {t("votes-dashboard.list.empty")}
          </p>
        ) : (
          <ul className="space-y-4">
            {partners.map((partner) => (
              <li
                key={partner.id}
                className={`rounded-xl p-4 ${DASHBOARD_PALETTE.card} transition-colors hover:border-cyan-500/30`}
              >
                <img
                  src={partner.img_url}
                  alt={partner.name}
                  className="mx-auto mb-3 h-48 w-48 object-cover rounded-full select-none sm:h-56 sm:w-56"
                  loading="lazy"
                />
                <p className={`text-center text-xl font-semibold ${DASHBOARD_PALETTE.text}`}>
                  {partner.name}
                </p>

                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleEdit(partner)}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium ${DASHBOARD_PALETTE.accentBorder} ${DASHBOARD_PALETTE.accent} hover:bg-cyan-500/10`}
                  >
                    {t("votes-dashboard.list.edit")}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(partner.id)}
                    className={DASHBOARD_PALETTE.btnDanger}
                  >
                    {t("votes-dashboard.list.delete")}
                  </button>
                </div>
              </li>
            )            )}
          </ul>
        )}
        </DashboardSection>
      </div>
    </div>
  );
};

export default VotesDashboard;
