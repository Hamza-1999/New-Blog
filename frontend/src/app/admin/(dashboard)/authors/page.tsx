"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, X, UserPlus, Users } from "lucide-react";
import { User } from "@/types";

export default function AuthorsPage() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "author", bio: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await usersApi.getAll();
      return res.data;
    },
  });

  const createUser = useMutation({
    mutationFn: (data: { name: string; email: string; password: string; role?: string; bio?: string }) =>
      usersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Author created!");
      resetForm();
    },
    onError: () => toast.error("Failed to create author"),
  });

  const updateUser = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, string | undefined> }) =>
      usersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Author updated!");
      resetForm();
    },
    onError: () => toast.error("Failed to update author"),
  });

  const deleteUser = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Author deleted");
    },
    onError: () => toast.error("Failed to delete author"),
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingUser(null);
    setForm({ name: "", email: "", password: "", role: "author", bio: "" });
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setForm({ name: user.name, email: user.email, password: "", role: user.role, bio: user.bio || "" });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      const data: Record<string, string | undefined> = {
        name: form.name,
        email: form.email,
        role: form.role,
        bio: form.bio,
      };
      if (form.password) data.password = form.password;
      updateUser.mutate({ id: editingUser.id, data });
    } else {
      createUser.mutate(form);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? Their blogs will also be deleted.`)) return;
    deleteUser.mutate(id);
  };

  if (currentUser?.role !== "admin") {
    return (
      <div className="text-center py-32 text-muted-foreground">
        <Users size={48} className="mx-auto mb-4 opacity-40" />
        <p className="font-medium text-lg">Admin Access Required</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          Authors
        </h1>
        <Button onClick={() => setShowForm(true)} className="gap-2" size="sm">
          <UserPlus size={16} /> <span className="hidden sm:inline">Add Author</span><span className="sm:hidden">Add</span>
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{editingUser ? "Edit Author" : "New Author"}</h3>
            <button onClick={resetForm} className="p-1 hover:bg-accent rounded-md">
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Name *</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email *</label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{editingUser ? "New Password (optional)" : "Password *"}</label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required={!editingUser}
                  placeholder={editingUser ? "Leave blank to keep current" : ""}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="flex h-10 w-full rounded-lg border border-input bg-card px-4 py-2 text-sm"
                >
                  <option value="author">Author</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Bio</label>
              <Input value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Short bio" />
            </div>
            <Button type="submit" disabled={createUser.isPending || updateUser.isPending}>
              {editingUser ? "Update Author" : "Create Author"}
            </Button>
          </form>
        </div>
      )}

      {/* Users List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
          </div>
        ) : !data?.users?.length ? (
          <div className="p-16 text-center text-muted-foreground">
            <Users size={36} className="mx-auto mb-3 opacity-40" />
            <p>No authors found</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {data.users.map((author: User) => (
              <div key={author.id} className="p-3 sm:p-4 flex items-start sm:items-center gap-3 sm:gap-4 hover:bg-accent/20 transition-colors">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0 text-sm sm:text-base">
                  {author.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium text-sm">{author.name}</h3>
                    <Badge variant={author.role === "admin" ? "default" : "secondary"} className="text-[10px]">
                      {author.role}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 mt-0.5">
                    <span className="text-xs text-muted-foreground truncate">{author.email}</span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{author._count?.blogs || 0} blogs</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(author)}>
                    <Pencil size={14} />
                  </Button>
                  {author.id !== currentUser?.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(author.id, author.name)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
