import { create, deleteTeleport, getTeleports } from "@/api/teleports";
import LoadingSpinnerCentral from "@/components/utilities/loading-spinner-v2";
import { Teleport } from "@/model/teleport";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

interface TeleportDashboardProps {
  token: string;
  realmId: number;
  t: (key: string) => string;
}

const TeleportDashboard: React.FC<TeleportDashboardProps> = ({
  token,
  realmId,
  t,
}) => {
  const [loading, setLoading] = useState(true);
  const [teleports, setTeleports] = useState<Teleport[]>([]);

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const data = await getTeleports(0, realmId, token);
      setTeleports(data);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: t("teleport-dashboard.errors.fetch-teleports"),
      });
    } finally {
      setLoading(false);
    }
  };
  const [form, setForm] = useState<Omit<Teleport, "id">>({
    name: "",
    position_x: 0,
    position_y: 0,
    position_z: 0,
    img_url: "",
    map: 0,
    orientation: 0,
    zone: 0,
    area: 0,
    faction: "neutral",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (
      (name === "map" && value.length > 9) ||
      (name === "zone" && value.length > 9) ||
      (name === "area" && value.length > 20) ||
      (name === "orientation" && value.length > 20) ||
      (name === "img_url" && value.length > 200) ||
      (name === "name" && value.length > 50) ||
      (name === "position_x" && value.length > 20) ||
      (name === "position_y" && value.length > 20) ||
      (name === "position_z" && value.length > 20)
    ) {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Exceeds maximum length. Please enter a valid value.",
      });
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: [
        "position_x",
        "position_y",
        "position_z",
        "map",
        "orientation",
        "zone",
        "area",
      ].includes(name)
        ? Number(value)
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await create(
        form.name,
        form.img_url,
        form.position_x,
        form.position_y,
        form.position_z,
        form.map,
        form.orientation,
        form.zone,
        realmId,
        form.area,
        form.faction,
        token
      );

      Swal.fire({
        icon: "success",
        title: t("teleport-dashboard.success.add-teleport"),
        text: t("teleport-dashboard.success.text-teleport"),
      });

      fetchData();
      setForm({
        name: "",
        position_x: 0,
        position_y: 0,
        position_z: 0,
        img_url: "",
        map: 0,
        orientation: 0,
        zone: 0,
        area: 0,
        faction: "neutral",
      });
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `${err.message}`,
      });
    }
  };
  const handleDelete = async (teleportId: number) => {
    const confirm = await Swal.fire({
      title: t("teleport-dashboard.question.title"),
      text: t("teleport-dashboard.question.delete-teleport"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("teleport-dashboard.question.btn.confirm"),
      cancelButtonText: t("teleport-dashboard.question.btn.cancel"),
    });

    if (confirm.isConfirmed) {
      try {
        await deleteTeleport(teleportId, realmId, token);
        Swal.fire(
          "Delete Teleport",
          t("teleport-dashboard.success.delete-teleport"),
          "success"
        );
        fetchData();
      } catch (err) {
        Swal.fire(
          "Error",
          t("teleport-dashboard.errors.delete-teleport"),
          "error"
        );
      }
    }
  };

  if (loading) {
    return (
      <div className=" bg-gray-900 min-h-screen flex items-center justify-center">
        <LoadingSpinnerCentral />
      </div>
    );
  }

  return (
    <div className="relative text-white p-8 bg-black rounded-2xl mx-4 my-6 border border-slate-700/30">
      {/* Fondo sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/20 via-slate-700/10 to-slate-800/20 rounded-2xl"></div>

      <div className="relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t("teleport-dashboard.intro-text")}
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-400 to-cyan-400 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Formulario */}
          <form
            onSubmit={handleSubmit}
            className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-600/30 rounded-2xl p-8 space-y-6 overflow-y-auto max-h-[80vh] scrollbar-hide transition-all duration-300 hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/20"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                {t("teleport-dashboard.title")}
              </h2>
              <div className="h-0.5 w-16 bg-gradient-to-r from-blue-400 to-cyan-400 mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  label: t("teleport-dashboard.labels.name"),
                  name: "name",
                  type: "text",
                },
                {
                  label: t("teleport-dashboard.labels.position_x"),
                  name: "position_x",
                  type: "number",
                },
                {
                  label: t("teleport-dashboard.labels.position_y"),
                  name: "position_y",
                  type: "number",
                },
                {
                  label: t("teleport-dashboard.labels.position_z"),
                  name: "position_z",
                  type: "number",
                },
                {
                  label: t("teleport-dashboard.labels.img_url"),
                  name: "img_url",
                  type: "text",
                },
                {
                  label: t("teleport-dashboard.labels.map"),
                  name: "map",
                  type: "number",
                },
                {
                  label: t("teleport-dashboard.labels.orientation"),
                  name: "orientation",
                  type: "number",
                },
                {
                  label: t("teleport-dashboard.labels.zone"),
                  name: "zone",
                  type: "number",
                },
                {
                  label: t("teleport-dashboard.labels.area"),
                  name: "area",
                  type: "number",
                },
              ].map(({ label, name, type }) => (
                <div key={name} className="flex flex-col">
                  <label className="mb-3 font-bold text-slate-100 text-lg">
                    {label}
                  </label>
                  <input
                    type={type}
                    name={name}
                    value={form[name as keyof typeof form]}
                    onChange={handleChange}
                    className="w-full p-5 rounded-lg bg-slate-800/70 border border-slate-600/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all duration-300 text-white text-lg placeholder-slate-400"
                    required
                    {...(name === "name" && { maxLength: 50 })}
                    {...([
                      "position_x",
                      "position_y",
                      "position_z",
                      "orientation",
                    ].includes(name) && {
                      min: -9000000000000,
                      max: 9000000000000,
                      step: 0.00000001,
                    })}
                    {...(["map", "zone", "area"].includes(name) && {
                      min: 0,
                      step: 1,
                    })}
                    {...(name === "img_url" && {
                      pattern: "https?://.+",
                      title:
                        "Introduce una URL válida que comience por http:// o https://",
                    })}
                  />
                </div>
              ))}

              <div className="col-span-2">
                <label className="block mb-3 font-bold text-slate-100 text-lg">
                  {t("teleport-dashboard.form-teleport.faction.title")}
                </label>
                <select
                  name="faction"
                  value={form.faction}
                  onChange={handleChange}
                  className="w-full p-5 rounded-lg bg-slate-800/70 border border-slate-600/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all duration-300 text-white text-lg"
                >
                  <option value="ALL">
                    {t(
                      "teleport-dashboard.form-teleport.faction.select-neutral"
                    )}
                  </option>
                  <option value="HORDE">
                    {t("teleport-dashboard.form-teleport.faction.select-horde")}
                  </option>
                  <option value="ALLIANCE">
                    {t(
                      "teleport-dashboard.form-teleport.faction.select-alliance"
                    )}
                  </option>
                </select>
              </div>

              <div className="col-span-2">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-bold px-8 py-5 rounded-lg border border-blue-400/30 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 text-xl"
                >
                  {t("teleport-dashboard.buttons.add-teleport")}
                </button>
              </div>
            </div>
          </form>

          {/* Listado */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-600/30 rounded-2xl p-8 space-y-6 overflow-y-auto max-h-[80vh] scrollbar-hide transition-all duration-300 hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/20">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                {t("teleport-dashboard.teleports-list.title")}
              </h2>
              <div className="h-0.5 w-16 bg-gradient-to-r from-blue-400 to-cyan-400 mx-auto rounded-full"></div>
            </div>

            {teleports.length === 0 ? (
              <p className="text-gray-400">
                {t("teleport-dashboard.teleports-list.empty")}
              </p>
            ) : (
              teleports.map((tp) => (
                <div
                  key={tp.id}
                  className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-xl p-6 border border-slate-600/30 shadow-sm space-y-4 hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
                >
                  <div className="space-y-5">
                    <div>
                      <span className="font-bold text-blue-300 text-lg">
                        {t("teleport-dashboard.teleports-list.columns.name")}:
                      </span>{" "}
                      <span className="text-white text-xl font-semibold">
                        {tp.name}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-blue-300 text-lg">
                        {t(
                          "teleport-dashboard.teleports-list.columns.location"
                        )}
                        :
                      </span>{" "}
                      <span className="text-white text-xl">
                        X: {tp.position_x}, Y: {tp.position_y}, Z:{" "}
                        {tp.position_z}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-blue-300 text-lg">
                        {t("teleport-dashboard.teleports-list.columns.map")}:
                      </span>{" "}
                      <span className="text-white text-xl">{tp.map}</span>
                    </div>
                    <div>
                      <span className="font-bold text-blue-300 text-lg">
                        {t(
                          "teleport-dashboard.teleports-list.columns.orientation"
                        )}
                        :
                      </span>{" "}
                      <span className="text-white text-xl">
                        {tp.orientation}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-blue-300 text-lg">
                        {t("teleport-dashboard.teleports-list.columns.zone")}:
                      </span>{" "}
                      <span className="text-white text-xl">{tp.zone}</span> |{" "}
                      <span className="font-bold text-blue-300 text-lg">
                        {t("teleport-dashboard.teleports-list.columns.area")}:
                      </span>{" "}
                      <span className="text-white text-xl">{tp.area}</span>
                    </div>
                    <div>
                      <span className="font-bold text-blue-300 text-lg">
                        {t("teleport-dashboard.teleports-list.columns.faction")}
                        :
                      </span>{" "}
                      <span className="text-white text-xl">{tp.faction}</span>
                    </div>
                  </div>
                  {tp.img_url && (
                    <img
                      src={tp.img_url}
                      alt={`Imagen de ${tp.name}`}
                      className="mt-4 w-full max-h-48 object-cover rounded-lg border border-slate-600/50 transition-all duration-300 hover:scale-105 hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/20"
                    />
                  )}
                  <button
                    onClick={() => handleDelete(tp.id)}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-bold px-8 py-5 rounded-lg border border-red-400/30 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 text-xl"
                  >
                    {t("teleport-dashboard.buttons.delete-teleport")}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeleportDashboard;
