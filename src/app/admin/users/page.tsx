import { requirePlatformAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { Card, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function AdminUsersPage() {
  await requirePlatformAdmin();

  // Apenas usuários do nível SuperAdmin
  const users = await prisma.user.findMany({
    where: {
      role: { in: ["PLATFORM_ADMIN", "PLATFORM_OPERATOR"] }
    },
    orderBy: { createdAt: "asc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Equipe SuperAdmin</h1>
          <p className="mt-2 text-sm text-slate-500">Membros da equipe com acesso à administração global da plataforma.</p>
        </div>
        <Link href="/admin/users/new" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
          + Adicionar Novo Usuário
        </Link>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr className="border-b text-slate-500">
                <th className="px-6 py-4 font-medium">Nome</th>
                <th className="px-6 py-4 font-medium">E-mail</th>
                <th className="px-6 py-4 font-medium">Nível de Acesso</th>
                <th className="px-6 py-4 font-medium">Data de Cadastro</th>
                <th className="px-6 py-4 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {user.name || "Sem Nome"}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                      user.role === 'PLATFORM_ADMIN' 
                      ? 'bg-purple-50 text-purple-700 ring-purple-600/20' 
                      : 'bg-blue-50 text-blue-700 ring-blue-600/20'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-600 hover:text-blue-900 font-medium text-sm">
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
