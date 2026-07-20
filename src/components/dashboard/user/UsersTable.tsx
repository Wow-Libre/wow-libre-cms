import type { AccountsServer } from "@/model/model";

interface UserStatusBadgeProps {
  kind: "online" | "offline" | "mute" | "banned" | "failed";
  label: string;
}

/**
 * Badge unificado para estados de la tabla de usuarios.
 * Colores normalizados: emerald (online / sin fallos), slate (offline),
 * amber (mute), red (baneado / con fallos).
 */
export function UserStatusBadge({ kind, label }: UserStatusBadgeProps) {
  const styles: Record<UserStatusBadgeProps["kind"], string> = {
    online: "border-emerald-500/35 bg-emerald-500/10 text-emerald-200",
    offline: "border-slate-600/50 bg-slate-800/70 text-slate-400",
    mute: "border-amber-500/35 bg-amber-500/10 text-amber-200",
    banned: "border-red-500/35 bg-red-500/10 text-red-200",
    failed: "border-red-500/35 bg-red-500/10 text-red-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-base font-semibold tabular-nums ${styles[kind]}`}
    >
      <span className="sr-only">Estado:</span>
      {label}
    </span>
  );
}

interface UsersTableProps {
  users: AccountsServer[];
  onSelect: (user: AccountsServer) => void;
}

/**
 * Tabla semántica y accesible. Filas clickeables (con soporte teclado) y
 * badges de estado. El scroll vertical lo gestiona el `<main>` del layout
 * (sin contenedor interno con altura limitada para evitar doble scrollbar
 * y huecos en blanco según el número de filas).
 */
export function UsersTable({ users, onSelect }: UsersTableProps) {
  const handleRowKeyDown = (e: React.KeyboardEvent<HTMLTableRowElement>, user: AccountsServer) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(user);
    }
  };

  return (
    <table className="w-full table-auto border-collapse text-base" aria-label="Usuarios del servidor">
      <caption className="sr-only">
        Listado de usuarios del servidor y estado de sus cuentas
      </caption>
      <thead>
        <tr className="border-b border-slate-700/60 text-left text-sm font-semibold uppercase tracking-wide text-slate-300">
          <th scope="col" className="px-6 py-4">ID</th>
          <th scope="col" className="px-6 py-4">Usuario</th>
          <th scope="col" className="px-6 py-4">Email</th>
          <th scope="col" className="px-6 py-4">Estado</th>
          <th scope="col" className="px-6 py-4">Última IP</th>
          <th scope="col" className="px-6 py-4">Fallos</th>
          <th scope="col" className="px-6 py-4">OS</th>
          <th scope="col" className="px-6 py-4">Expansión</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-800/80">
        {users.map((user) => {
          const failedLogins = Number(user.failed_logins);
          return (
            <tr
              key={user.id}
              role="button"
              tabIndex={0}
              aria-label={`Administrar usuario ${user.username}`}
              onClick={() => onSelect(user)}
              onKeyDown={(e) => handleRowKeyDown(e, user)}
              className="group cursor-pointer bg-slate-900/40 transition-colors hover:bg-slate-800/35 focus-visible:bg-slate-800/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 focus-visible:ring-inset"
            >
              <td className="px-6 py-4 align-middle">
                <span className="text-base font-bold tabular-nums text-indigo-300">#{user.id}</span>
              </td>
              <td className="px-6 py-4 align-middle">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-indigo-500/40 bg-gradient-to-br from-indigo-500/25 to-violet-600/25"
                    aria-hidden
                  >
                    <span className="text-base font-bold text-indigo-100">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-base font-semibold text-white break-all">{user.username}</span>
                </div>
              </td>
              <td className="px-6 py-4 align-middle text-base text-slate-300 break-all">{user.email}</td>
              <td className="px-6 py-4 align-middle">
                <div className="flex flex-wrap gap-2">
                  <UserStatusBadge
                    kind={user.online ? "online" : "offline"}
                    label={user.online ? "Online" : "Offline"}
                  />
                  {user.mute && <UserStatusBadge kind="mute" label="Muteado" />}
                  {user.banned && <UserStatusBadge kind="banned" label="Baneado" />}
                </div>
              </td>
              <td className="px-6 py-4 align-middle">
                <span className="font-mono text-base text-slate-300">{user.last_ip}</span>
              </td>
              <td className="px-6 py-4 align-middle">
                {Number.isFinite(failedLogins) && failedLogins > 0 ? (
                  <UserStatusBadge kind="failed" label={String(failedLogins)} />
                ) : (
                  <span className="text-base text-slate-400 tabular-nums">0</span>
                )}
              </td>
              <td className="px-6 py-4 align-middle text-base text-slate-300">{user.os}</td>
              <td className="px-6 py-4 align-middle text-base text-slate-300">{user.expansion}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
