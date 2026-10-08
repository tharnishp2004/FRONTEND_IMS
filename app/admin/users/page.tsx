"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Users,
  UserPlus,
  Search,
  ShieldCheck,
  UserCheck,
  Eye,
  Edit2,
  Trash2,
  Lock,
  User,
  CheckCircle2,
} from "lucide-react";
import { API_URL } from "@/app/lib/api";
import { Badge } from "@/app/components/ui/Badge";
import { Modal } from "@/app/components/ui/Modal";
import { ConfirmDialog } from "@/app/components/ui/ConfirmDialog";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { TableSkeleton } from "@/app/components/ui/LoadingSpinner";
import { StatCard } from "@/app/components/ui/StatCard";

interface UserItem {
  id: number | string;
  name: string;
  username: string;
  role: string;
  password?: string;
}

const EMPTY_USER = {
  name: "",
  username: "",
  role: "viewer",
  password: "123",
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [form, setForm] = useState(EMPTY_USER);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete State
  const [deleteId, setDeleteId] = useState<string | number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/users`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const name = (u.name || "").toLowerCase();
      const username = (u.username || "").toLowerCase();
      const matchesSearch =
        name.includes(searchQuery.toLowerCase()) ||
        username.includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (roleFilter !== "ALL" && (u.role || "").toLowerCase() !== roleFilter.toLowerCase()) {
        return false;
      }

      return true;
    });
  }, [users, searchQuery, roleFilter]);

  const openAddModal = () => {
    setEditingUser(null);
    setForm(EMPTY_USER);
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (u: UserItem) => {
    setEditingUser(u);
    setForm({
      name: u.name,
      username: u.username,
      role: (u.role || "viewer").toLowerCase(),
      password: u.password || "",
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.username.trim()) {
      return setFormError("Name and username are required.");
    }
    if (form.password && form.password.length > 10) {
      return setFormError("Password must be 10 characters or less.");
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      const payload = {
        name: form.name.trim(),
        username: form.username.trim(),
        role: form.role.toLowerCase(),
        password: form.password || "123",
      };

      if (editingUser) {
        await fetch(`${API_URL}/users/${editingUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...editingUser, ...payload }),
        });
      } else {
        await fetch(`${API_URL}/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      setFormError("Failed to save user account. Username may already exist.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await fetch(`${API_URL}/users/${deleteId}`, { method: "DELETE" });
      setDeleteId(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const adminCount = users.filter((u) => (u.role || "").toLowerCase() === "admin").length;
  const staffCount = users.filter((u) => (u.role || "").toLowerCase() === "staff").length;
  const viewerCount = users.filter((u) => (u.role || "").toLowerCase() === "viewer").length;

  const getRoleBadge = (role: string) => {
    const r = (role || "").toLowerCase();
    if (r === "admin") return <Badge variant="admin" dot>Administrator</Badge>;
    if (r === "staff") return <Badge variant="staff" dot>Operations Staff</Badge>;
    return <Badge variant="viewer" dot>Guest Viewer</Badge>;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-[#dce2de] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#1a1f1c] tracking-tight">
              User & Role Management
            </h1>
            <Badge variant="admin">Admin Privilege</Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#616d65] mt-1 font-medium">
            Grant system permissions, promote users between Admin, Staff, and Viewer roles, and audit account access.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#3f6549] hover:bg-[#34553d] text-white text-xs font-semibold shadow-xs shadow-[#3f6549]/20 transition-all cursor-pointer active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add System User</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Accounts"
          value={users.length}
          icon={Users}
          subtitle="Registered accounts"
          accentColor="sage"
        />
        <StatCard
          title="Administrators"
          value={adminCount}
          icon={ShieldCheck}
          subtitle="Full access control"
          accentColor="sage"
        />
        <StatCard
          title="Operations Staff"
          value={staffCount}
          icon={UserCheck}
          subtitle="Inventory & sales operators"
          accentColor="amber"
        />
        <StatCard
          title="Read-Only Viewers"
          value={viewerCount}
          icon={Eye}
          subtitle="Audit & report observers"
          accentColor="concrete"
        />
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#dce2de] shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7f8b83]" />
          <input
            type="text"
            placeholder="Search by full name or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#f6f8f6] border border-[#dce2de] rounded-xl text-xs sm:text-sm font-medium text-[#1a1f1c] placeholder-[#7f8b83] focus:outline-none focus:ring-2 focus:ring-[#4d7557] focus:bg-white transition-all"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3.5 py-2 bg-[#f6f8f6] border border-[#dce2de] rounded-xl text-xs sm:text-sm font-medium text-[#3e4841] focus:outline-none focus:ring-2 focus:ring-[#4d7557] transition-all cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Administrators</option>
            <option value="STAFF">Operations Staff</option>
            <option value="VIEWER">Guest Viewers</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-[#dce2de] shadow-xs overflow-hidden">
        {loading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Users Found"
            description="No user accounts match your search or role filter criteria."
            actionText="+ Create System User"
            onAction={openAddModal}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#f6f8f6] border-b border-[#dce2de] text-[#616d65] font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Username / Identity</th>
                  <th className="py-3.5 px-4">Permission Role</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf0ee]">
                {filteredUsers.map((u, idx) => (
                  <tr key={u.id} className="hover:bg-[#f9faf9] transition-colors">
                    <td className="py-4 px-4 text-center text-[#7f8b83] font-mono text-xs">
                      {idx + 1}
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#eaf1ec] text-[#2c5237] font-bold flex items-center justify-center shrink-0 border border-[#c4dac9]">
                          {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div>
                          <span className="font-bold text-[#1a1f1c] block">{u.name}</span>
                          <span className="text-[10px] text-[#7f8b83]">UID: #{u.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-mono text-[#4d5750] font-semibold">
                      @{u.username}
                    </td>

                    <td className="py-4 px-4">{getRoleBadge(u.role)}</td>

                    <td className="py-4 px-4">
                      <Badge variant="success" dot>
                        Active
                      </Badge>
                    </td>

                    <td className="py-4 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => openEditModal(u)}
                        className="p-1.5 rounded-lg border border-[#dce2de] text-[#4d5750] hover:text-[#3f6549] hover:bg-[#eaf1ec] transition-colors cursor-pointer"
                        title="Edit User Role"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteId(u.id)}
                        className="p-1.5 rounded-lg border border-[#dce2de] text-[#4d5750] hover:text-[#a63519] hover:bg-[#faece1] transition-colors cursor-pointer"
                        title="Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit User Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingUser ? "Edit User Permissions" : "Register New System User"}
        description="Set user identity and assign system role permissions"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-[#faece1] border border-[#eec6a9] text-[#a64516] text-xs font-semibold">
              {formError}
            </div>
          )}

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#343b36]">Full Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Rachel Adams"
                className="w-full px-3.5 py-2.5 bg-[#f6f8f6] border border-[#dce2de] rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4d7557] focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#343b36]">Username</label>
              <input
                type="text"
                required
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="e.g. radams"
                className="w-full px-3.5 py-2.5 bg-[#f6f8f6] border border-[#dce2de] rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4d7557] focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-[#343b36]">
                  Password {editingUser && "(Leave blank or update)"}
                </label>
                <span className={`text-[11px] ${form.password.length > 10 ? 'text-[#c65922] font-bold' : 'text-[#717e75]'}`}>
                  {form.password.length > 0 ? `${form.password.length}/10 chars` : "Max 10 chars"}
                </span>
              </div>
              <input
                type="password"
                required={!editingUser}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className={`w-full px-3.5 py-2.5 bg-[#f6f8f6] border rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:bg-white ${
                  form.password.length > 10
                    ? "border-[#c65922] focus:ring-[#c65922]"
                    : "border-[#dce2de] focus:ring-[#4d7557]"
                }`}
              />
              {form.password.length > 10 && (
                <p className="text-[11px] font-semibold text-[#c65922]">Password must be 10 characters or less.</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#343b36]">System Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#f6f8f6] border border-[#dce2de] rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4d7557] focus:bg-white cursor-pointer"
              >
                <option value="viewer">Guest Viewer (Read-Only)</option>
                <option value="staff">Operations Staff (Inventory & Orders)</option>
                <option value="admin">Administrator (Full Control)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-5 border-t border-[#edf0ee]">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-[#dce2de] text-xs font-semibold text-[#4d5750] hover:bg-[#f6f8f6] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#3f6549] hover:bg-[#34553d] text-white text-xs font-semibold shadow-xs shadow-[#3f6549]/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting
                ? "Saving..."
                : editingUser
                ? "Update User"
                : "Create User"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete User Account"
        message="Are you sure you want to permanently delete this user account? The user will immediately lose access to the system."
        confirmText="Delete Account"
        isLoading={isDeleting}
      />
    </div>
  );
}
