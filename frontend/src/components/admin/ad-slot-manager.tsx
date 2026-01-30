"use client";

import { useState } from "react";
import {
  useAdminAdSlots,
  useCreateAdSlot,
  useUpdateAdSlot,
  useDeleteAdSlot,
} from "@/hooks/use-ad-slots";
import { AdSlot, AdFormat, AdPlacement } from "@/types";
import { PLACEMENT_LABELS, FORMAT_LABELS, ALL_PLACEMENTS, ALL_FORMATS } from "@/lib/ad-constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, X, LayoutGrid } from "lucide-react";

interface SlotFormData {
  name: string;
  slotId: string;
  format: AdFormat;
  placement: AdPlacement | "";
  isActive: boolean;
}

const emptyForm: SlotFormData = {
  name: "",
  slotId: "",
  format: "horizontal",
  placement: "",
  isActive: true,
};

export function AdSlotManager() {
  const { data, isLoading } = useAdminAdSlots();
  const createMutation = useCreateAdSlot();
  const updateMutation = useUpdateAdSlot();
  const deleteMutation = useDeleteAdSlot();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SlotFormData>(emptyForm);

  const slots = data?.slots || [];
  const usedPlacements = slots
    .filter((s) => s.id !== editingId)
    .map((s) => s.placement);
  const availablePlacements = ALL_PLACEMENTS.filter(
    (p) => !usedPlacements.includes(p)
  );

  const resetForm = () => {
    setForm(emptyForm);
    setShowForm(false);
    setEditingId(null);
  };

  const startEdit = (slot: AdSlot) => {
    setForm({
      name: slot.name,
      slotId: slot.slotId,
      format: slot.format,
      placement: slot.placement,
      isActive: slot.isActive,
    });
    setEditingId(slot.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slotId || !form.placement) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          data: {
            name: form.name,
            slotId: form.slotId,
            format: form.format,
            placement: form.placement,
            isActive: form.isActive,
          },
        });
        toast.success("Ad slot updated");
      } else {
        await createMutation.mutateAsync({
          name: form.name,
          slotId: form.slotId,
          format: form.format,
          placement: form.placement,
          isActive: form.isActive,
        });
        toast.success("Ad slot created");
      }
      resetForm();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      const message =
        axiosErr?.response?.data?.error || "Something went wrong";
      toast.error(message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this ad slot?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Ad slot deleted");
    } catch {
      toast.error("Failed to delete ad slot");
    }
  };

  const handleToggle = async (slot: AdSlot) => {
    try {
      await updateMutation.mutateAsync({
        id: slot.id,
        data: { isActive: !slot.isActive },
      });
      toast.success(slot.isActive ? "Ad slot disabled" : "Ad slot enabled");
    } catch {
      toast.error("Failed to update ad slot");
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <section className="bg-card border border-border rounded-xl overflow-hidden animate-fade-up stagger-3">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
            <LayoutGrid size={13} className="text-primary" />
          </div>
          <h2
            className="text-[13px] font-semibold tracking-wide uppercase"
            style={{ letterSpacing: "0.06em" }}
          >
            Ad Slots
          </h2>
        </div>
        {!showForm && (
          <Button
            size="sm"
            className="text-[12px] h-7 px-3 gap-1.5"
            onClick={() => {
              setForm(emptyForm);
              setEditingId(null);
              setShowForm(true);
            }}
          >
            <Plus size={12} />
            Add Slot
          </Button>
        )}
      </div>

      <div className="p-5">
        {/* Inline form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="border border-border rounded-lg p-4 mb-4 bg-secondary/20"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                {editingId ? "Edit Ad Slot" : "New Ad Slot"}
              </h3>
              <button
                type="button"
                onClick={resetForm}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[12px] font-medium text-muted-foreground mb-1">
                  Name
                </label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Homepage Banner"
                  className="h-9 text-[13px]"
                  required
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-muted-foreground mb-1">
                  AdSense Slot ID
                </label>
                <Input
                  value={form.slotId}
                  onChange={(e) => setForm({ ...form, slotId: e.target.value })}
                  placeholder="e.g. 1234567890"
                  className="h-9 text-[13px] font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-muted-foreground mb-1">
                  Format
                </label>
                <select
                  value={form.format}
                  onChange={(e) =>
                    setForm({ ...form, format: e.target.value as AdFormat })
                  }
                  className="w-full h-9 text-[13px] rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {ALL_FORMATS.map((f) => (
                    <option key={f} value={f}>
                      {FORMAT_LABELS[f]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-muted-foreground mb-1">
                  Placement
                </label>
                <select
                  value={form.placement}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      placement: e.target.value as AdPlacement,
                    })
                  }
                  className="w-full h-9 text-[13px] rounded-md border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                >
                  <option value="">Select placement...</option>
                  {availablePlacements.map((p) => (
                    <option key={p} value={p}>
                      {PLACEMENT_LABELS[p]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-[12px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                  className="rounded border-input"
                />
                <span className="text-muted-foreground">Active</span>
              </label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-[12px] h-8 px-4"
                  onClick={resetForm}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="text-[12px] h-8 px-4"
                  disabled={isSaving}
                >
                  {isSaving
                    ? "Saving..."
                    : editingId
                    ? "Update Slot"
                    : "Create Slot"}
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
          </div>
        ) : slots.length === 0 ? (
          <div className="text-center py-8">
            <LayoutGrid
              size={28}
              className="mx-auto text-muted-foreground/30 mb-2"
            />
            <p className="text-[13px] text-muted-foreground">
              No ad slots configured yet
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Add your first ad slot to start showing ads
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Name</th>
                  <th className="pb-2 pr-4 font-medium">Slot ID</th>
                  <th className="pb-2 pr-4 font-medium">Format</th>
                  <th className="pb-2 pr-4 font-medium">Placement</th>
                  <th className="pb-2 pr-4 font-medium">Status</th>
                  <th className="pb-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {slots.map((slot) => (
                  <tr key={slot.id} className="group">
                    <td className="py-2.5 pr-4 font-medium text-foreground">
                      {slot.name}
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-muted-foreground">
                      {slot.slotId}
                    </td>
                    <td className="py-2.5 pr-4 text-muted-foreground capitalize">
                      {slot.format}
                    </td>
                    <td className="py-2.5 pr-4 text-muted-foreground">
                      {PLACEMENT_LABELS[slot.placement]}
                    </td>
                    <td className="py-2.5 pr-4">
                      <button
                        onClick={() => handleToggle(slot)}
                        className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                          slot.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            : "bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            slot.isActive ? "bg-emerald-500" : "bg-gray-400"
                          }`}
                        />
                        {slot.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(slot)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                          title="Edit"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(slot.id)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
