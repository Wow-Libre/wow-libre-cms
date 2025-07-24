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
    <div className=" relative text-gray-300 p-8 bg-black m-10">
      {/* Imagen de fondo */}
      <div className="absolute inset-0 bg-cover bg-center opacity-40" />
      <div className="absolute inset-0 bg-black opacity-70" />

      <div className="relative z-10 ">
        <p className="m-2  pb-5 text-2xl md:text-2xl lg:text-2xl xl:text-2xl font-bold text-center text-[#F5C657] mb-4">
          {t("teleport-dashboard.intro-text")}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 max-w-8xl mx-auto">
          {/* Formulario */}
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-[800px] bg-[#1a1a1a] border border-[#7a5b26] rounded-xl p-8 space-y-6 overflow-y-auto max-h-[80vh] scrollbar-hide transition-shadow duration-300 hover:shadow-[0_0_20px_4px_#7a5b26]"
          >
            <h2 className="text-5xl font-bold text-[#EAC784] mb-10">
              {t("teleport-dashboard.title")}
            </h2>

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
                  <label className="mb-1 font-semibold md:text-2xl text-[#c2a25f]">
                    {label}
                  </label>
                  <input
                    type={type}
                    name={name}
                    value={form[name as keyof typeof form]}
                    onChange={handleChange}
                    className="md:text-2xl w-full p-3 rounded-md bg-[#2a2a2a] border border-gray-700 focus:border-[#bfa35f] outline-none"
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
                <label className="block mb-1 font-semibold text-[#c2a25f]">
                  {t("teleport-dashboard.form-teleport.faction.title")}
                </label>
                <select
                  name="faction"
                  value={form.faction}
                  onChange={handleChange}
                  className="w-full p-3 rounded-md bg-[#2a2a2a] border border-gray-700 focus:border-[#bfa35f]"
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
                  className="bg-transparent text-[#ffcc33] font-semibold px-6 py-3 rounded border border-[#ffcc33] hover:bg-gradient-to-r hover:from-[#ffcc33]/20 hover:to-[#ffcc33]/10 transition"
                >
                  {t("teleport-dashboard.buttons.add-teleport")}
                </button>
              </div>
            </div>
          </form>

          {/* Listado */}
          <div className="bg-[#1a1a1a] border border-[#7a5b26] rounded-xl p-8 space-y-6 overflow-y-auto max-h-[80vh] scrollbar-hide transition-shadow duration-300 hover:shadow-[0_0_20px_4px_#7a5b26]">
            <h2 className="text-5xl font-bold text-[#EAC784] mb-10">
              {t("teleport-dashboard.teleports-list.title")}
            </h2>

            {teleports.length === 0 ? (
              <p className="text-gray-400">
                {t("teleport-dashboard.teleports-list.empty")}
              </p>
            ) : (
              teleports.map((tp) => (
                <div
                  key={tp.id}
                  className="bg-[#2a2a2a] rounded-md p-4 border border-gray-700 shadow-sm space-y-2 hover:bg-[#3a3a3a]   hover:border-[#ffcc33]   hover:shadow-lg  transition duration-300 ease-in-out"
                >
                  <p>
                    <span className="font-semibold text-[#c2a25f] text-3xl">
                      {t("teleport-dashboard.teleports-list.columns.name")}
                    </span>{" "}
                    {tp.name}
                  </p>
                  <p>
                    <span className="font-semibold text-[#c2a25f] text-3xl">
                      {t("teleport-dashboard.teleports-list.columns.location")}
                    </span>{" "}
                    X: {tp.position_x}, Y: {tp.position_y}, Z: {tp.position_z}
                  </p>
                  <p>
                    <span className="font-semibold text-[#c2a25f] text-3xl">
                      {t("teleport-dashboard.teleports-list.columns.map")}:
                    </span>{" "}
                    {tp.map}
                  </p>
                  <p>
                    <span className="font-semibold text-[#c2a25f] text-3xl">
                      {t(
                        "teleport-dashboard.teleports-list.columns.orientation"
                      )}
                      :
                    </span>{" "}
                    {tp.orientation}
                  </p>
                  <p>
                    <span className="font-semibold text-[#c2a25f] text-3xl">
                      {t("teleport-dashboard.teleports-list.columns.zone")}:
                    </span>{" "}
                    {tp.zone} |{" "}
                    <span className="font-semibold">
                      {t("teleport-dashboard.teleports-list.columns.area")}:
                    </span>{" "}
                    {tp.area}
                  </p>
                  <p>
                    <span className="font-semibold text-[#c2a25f] text-3xl">
                      {t("teleport-dashboard.teleports-list.columns.faction")}:
                    </span>{" "}
                    {tp.faction}
                  </p>
                  {tp.img_url && (
                    <img
                      src={tp.img_url}
                      alt={`Imagen de ${tp.name}`}
                      className="mt-2 w-full max-h-52 object-cover rounded-md border border-gray-600 
             transition-transform  duration-300 ease-in-out 
             hover:scale-105 hover:border-[#ffcc33] hover:shadow-[0_0_15px_#ffcc33]"
                    />
                  )}
                  <button
                    onClick={() => handleDelete(tp.id)}
                    className="bg-gradient-to-r from-[#7a1f1f] to-[#a52a2a] text-[#ffcc33] font-semibold px-6 py-3 rounded border border-[#a52a2a] hover:brightness-110 transition"
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
