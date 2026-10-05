import { requireAuth } from "@/lib/auth/session";
import { getUsers } from "@/lib/db/admin-service";
import { isDatabaseLive } from "@/lib/db/service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserCog, Search, Plus, Mail, Phone, ShieldCheck } from "lucide-react";
import { AddUserDialog } from "@/components/admin/add-user-dialog";
import { UserActions } from "@/components/admin/user-actions";

interface SearchParams { search?: string; role?: string; page?: string }

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
  OPERATIONS_MANAGER: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  DRIVER: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
};

const ROLES = ["ALL", "SUPER_ADMIN", "OPERATIONS_MANAGER", "DRIVER"];

export default async function UsersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAuth(["SUPER_ADMIN"]);
  const params = await searchParams;
  const dbLive = await isDatabaseLive();

  const page = parseInt(params.page ?? "1", 10);
  const search = params.search ?? "";
  const role = params.role ?? "ALL";

  let data: Awaited<ReturnType<typeof getUsers>> = { users: [], total: 0, page: 1, totalPages: 1 };

  if (dbLive) {
    try { data = await getUsers({ search, role, page }); } catch {}
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">User Management</h1>
          <p className="text-sm text-muted-foreground">Manage system users, roles and access permissions</p>
        </div>
        {dbLive && <AddUserDialog />}
      </div>

      {/* Role breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Users", value: data.total, color: "text-blue-600" },
          { label: "Admins", value: data.users.filter(u => u.role === "SUPER_ADMIN").length, color: "text-purple-600" },
          { label: "Operations", value: data.users.filter(u => u.role === "OPERATIONS_MANAGER").length, color: "text-blue-600" },
          { label: "Drivers", value: data.users.filter(u => u.role === "DRIVER").length, color: "text-emerald-600" },
        ].map(item => (
          <div key={item.label} className="rounded-xl border p-3 bg-card text-center">
            <p className={`text-lg font-bold ${item.color}`}>{dbLive ? item.value : "—"}</p>
            <p className="text-[11px] text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <form className="flex-1" method="get">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input name="search" defaultValue={search} placeholder="Search by name, email, phone..." className="pl-9 h-9" />
                {role !== "ALL" && <input type="hidden" name="role" value={role} />}
              </div>
            </form>
            <div className="flex gap-1.5 flex-wrap">
              {ROLES.map(r => (
                <a
                  key={r}
                  href={`/admin/users?role=${r}${search ? `&search=${search}` : ""}`}
                  className={`text-[11px] px-2.5 py-1 rounded-full border font-medium transition-all ${
                    role === r
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:border-foreground/30"
                  }`}
                >
                  {r === "ALL" ? "All" : r.replace("_", " ")}
                </a>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {!dbLive ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <UserCog className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium">Database Offline</p>
            </div>
          ) : data.users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <UserCog className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium">No users found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">User</TableHead>
                    <TableHead className="text-xs">Contact</TableHead>
                    <TableHead className="text-xs">Role</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Joined</TableHead>
                    <TableHead className="text-xs">Driver Profile</TableHead>
                    <TableHead className="text-xs w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.users.map((user: any) => {
                    const initials = user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.id.slice(0, 8)}...</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />{user.email}
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Phone className="h-3 w-3" />{user.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${ROLE_COLORS[user.role]}`}>
                            {user.role.replace("_", " ")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.isActive ? "default" : "secondary"} className={`text-[10px] ${user.isActive ? "bg-emerald-600" : ""}`}>
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString("en-IN")}
                        </TableCell>
                        <TableCell className="text-xs">
                          {user.driverProfile ? (
                            <span className="text-emerald-600 font-medium">Linked</span>
                          ) : user.role === "DRIVER" ? (
                            <span className="text-amber-600">Not linked</span>
                          ) : <span className="text-muted-foreground">N/A</span>}
                        </TableCell>
                        <TableCell>
                          <UserActions userId={user.id} userName={user.name} isActive={user.isActive} role={user.role} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {data.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-xs text-muted-foreground">Page {data.page} of {data.totalPages} · {data.total} users</p>
                  <div className="flex gap-2">
                    {data.page > 1 && <a href={`/admin/users?page=${data.page - 1}&role=${role}&search=${search}`}><Button variant="outline" size="sm" className="h-7 text-xs">Previous</Button></a>}
                    {data.page < data.totalPages && <a href={`/admin/users?page=${data.page + 1}&role=${role}&search=${search}`}><Button variant="outline" size="sm" className="h-7 text-xs">Next</Button></a>}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
