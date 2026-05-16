import { format, parseISO, isValid } from "date-fns";
import { Plus, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { updateProject } from "../features/workspaceSlice";
import AddProjectMember from "./AddProjectMember";

const toDateInput = (value) => {
    if (!value) return "";
    const d = typeof value === "string" ? parseISO(value) : new Date(value);
    return isValid(d) ? format(d, "yyyy-MM-dd") : "";
};

export default function ProjectSettings({ project }) {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (project) {
            setFormData({
                ...project,
                start_date: toDateInput(project.start_date),
                end_date: toDateInput(project.end_date),
            });
        }
    }, [project]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData) return;

        setIsSubmitting(true);
        try {
            const updated = {
                ...project,
                ...formData,
                start_date: formData.start_date ? new Date(formData.start_date).toISOString() : project.start_date,
                end_date: formData.end_date ? new Date(formData.end_date).toISOString() : project.end_date,
                updatedAt: new Date().toISOString(),
            };
            dispatch(updateProject(updated));
            toast.success("Project settings saved");
        } catch (err) {
            toast.error(err?.message || "Failed to save");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!formData) return null;

    const inputClasses = "ops-input w-full px-3 py-2 mt-1";
    const labelClasses = "text-sm block mb-1";

    return (
        <div className="grid lg:grid-cols-2 gap-6">
            <div className="ops-card p-6">
                <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Project Details</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className={labelClasses} style={{ color: 'var(--color-text-secondary)' }}>Project Name</label>
                        <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClasses} required />
                    </div>
                    <div>
                        <label className={labelClasses} style={{ color: 'var(--color-text-secondary)' }}>Description</label>
                        <textarea value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={`${inputClasses} h-24 resize-none`} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClasses} style={{ color: 'var(--color-text-secondary)' }}>Status</label>
                            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={`${inputClasses} ops-select w-full`}>
                                <option value="PLANNING">Planning</option>
                                <option value="ACTIVE">Active</option>
                                <option value="ON_HOLD">On Hold</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClasses} style={{ color: 'var(--color-text-secondary)' }}>Priority</label>
                            <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className={`${inputClasses} ops-select w-full`}>
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClasses} style={{ color: 'var(--color-text-secondary)' }}>Start Date</label>
                            <input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className={inputClasses} />
                        </div>
                        <div>
                            <label className={labelClasses} style={{ color: 'var(--color-text-secondary)' }}>End Date</label>
                            <input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} className={inputClasses} />
                        </div>
                    </div>
                    <div>
                        <label className={labelClasses} style={{ color: 'var(--color-text-secondary)' }}>
                            Progress: {formData.progress}%
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={formData.progress ?? 0}
                            onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
                            className="w-full mt-2"
                            style={{ accentColor: 'var(--color-accent-primary)' }}
                        />
                        <div className="ops-progress-track mt-2">
                            <div className="ops-progress-fill" style={{ width: `${formData.progress || 0}%` }} />
                        </div>
                    </div>
                    <button type="submit" disabled={isSubmitting} className="ops-btn-primary flex items-center gap-2 ml-auto">
                        <Save className="size-4" /> {isSubmitting ? "Saving..." : "Save Changes"}
                    </button>
                </form>
            </div>

            <div className="ops-card p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        Team Members <span className="text-sm font-normal" style={{ color: 'var(--color-text-tertiary)' }}>({project.members?.length || 0})</span>
                    </h2>
                    <button type="button" onClick={() => setIsDialogOpen(true)} className="ops-btn-secondary p-2">
                        <Plus className="size-4" />
                    </button>
                    <AddProjectMember isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {(project.members || []).map((member) => (
                        <div key={member.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg" style={{ background: 'var(--color-bg-tertiary)' }}>
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="ops-avatar-initials">{member.user?.name?.[0]}</span>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{member.user?.name}</p>
                                    <p className="text-xs truncate" style={{ color: 'var(--color-text-tertiary)' }}>{member.user?.email}</p>
                                </div>
                            </div>
                            {project.team_lead === member.userId && (
                                <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--color-accent-primary)' }}>Lead</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
