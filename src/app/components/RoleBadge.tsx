import { ROLE_COLORS } from "../utils/roles-permissions";
import type { Role } from "../utils/roles-permissions";

export function RoleBadge({ role }: { role: Role | string }) {
  const getRoleColor = (r: string) => {
    const colors: Record<string, string> = {
      "Maire": "bg-purple-100 text-purple-800 border-purple-200",
      "Receveur": "bg-blue-100 text-blue-800 border-blue-200",
      "Superviseur": "bg-green-100 text-green-800 border-green-200",
      "Agent recenseur": "bg-amber-100 text-amber-800 border-amber-200",
      "Agent recouvrement": "bg-teal-100 text-teal-800 border-teal-200",
      "Administrateur": "bg-purple-100 text-purple-800 border-purple-200"
    };
    return colors[r] || "bg-slate-100 text-slate-800 border-slate-200";
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium border rounded-sm font-mono tracking-wide ${getRoleColor(role)}`}>
      {role}
    </span>
  );
}
