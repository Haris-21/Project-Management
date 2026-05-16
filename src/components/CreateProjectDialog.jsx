import { useState } from "react";
import { XIcon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { addProject } from "../features/workspaceSlice";
import { createId } from "../lib/ids";

const initialForm = {
    name: "",
    description: "",
    status: "PLANNING",
    priority: "MEDIUM",
    start_date: "",
    end_date: "",
    team_members: [],
    team_lead: "",
    progress: 0,
};

const CreateProjectDialog = ({ isDialogOpen, setIsDialogOpen }) => {
    const dispatch = useDispatch();
    const { currentWorkspace } = useSelector((state) => state.workspace);
    const [formData, setFormData] = useState(initialForm);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentWorkspace) return;

        setIsSubmitting(true);
        try {
            const leadMember = currentWorkspace.members.find((m) => m.user.email === formData.team_lead);
            const memberEmails = new Set([...formData.team_members, formData.team_lead].filter(Boolean));
            const members = currentWorkspace.members
                .filter((m) => memberEmails.has(m.user.email))
                .map((m) => ({
                    id: createId(),
                    userId: m.userId,
                    projectId: "",
                    user: m.user,
                }));

            const projectId = createId();
            const project = {
                id: projectId,
                name: formData.name.trim(),
                description: formData.description.trim(),
                status: formData.status,
                priority: formData.priority,
                start_date: formData.start_date ? new Date(formData.start_date).toISOString() : new Date().toISOString(),
                end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
                team_lead: leadMember?.userId || leadMember?.user?.id || "",
                workspaceId: currentWorkspace.id,
                progress: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                tasks: [],
                members: members.map((m) => ({ ...m, projectId })),
            };

            dispatch(addProject(project));
            toast.success("Project created successfully");
            setFormData(initialForm);
            setIsDialogOpen(false);
        } catch (err) {
            toast.error(err?.message || "Failed to create project");
        } finally {
            setIsSubmitting(false);
        }
    };

    const removeTeamMember = (email) => {
        setFormData((prev) => ({ ...prev, team_members: prev.team_members.filter((m) => m !== email) }));
    };

    if (!isDialogOpen) return null;

    const labelClass = "block text-sm mb-1 font-medium";
    const fieldClass = "ops-input w-full px-3 py-2 mt-1";

    return (
        <div className="fixed inset-0 ops-modal-overlay flex items-center justify-center text-left z-50 p-4" onClick={() => setIsDialogOpen(false)}>
            <div className="ops-modal p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="absolute top-4 right-4 p-1 rounded hover:bg-white/5" style={{ color: 'var(--color-text-tertiary)' }} onClick={() => setIsDialogOpen(false)}>
                    <XIcon className="size-5" />
                </button>

                <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>Create New Project</h2>
                {currentWorkspace && (
                    <p className="text-sm mb-5" style={{ color: 'var(--color-text-secondary)' }}>
                        In workspace: <span style={{ color: 'var(--color-accent-primary)' }}>{currentWorkspace.name}</span>
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className={labelClass} style={{ color: 'var(--color-text-secondary)' }}>Project Name</label>
                        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter project name" className={fieldClass} required />
                    </div>

                    <div>
                        <label className={labelClass} style={{ color: 'var(--color-text-secondary)' }}>Description</label>
                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe your project" className={`${fieldClass} h-20 resize-none`} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass} style={{ color: 'var(--color-text-secondary)' }}>Status</label>
                            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={`${fieldClass} ops-select w-full`}>
                                <option value="PLANNING">Planning</option>
                                <option value="ACTIVE">Active</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="ON_HOLD">On Hold</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClass} style={{ color: 'var(--color-text-secondary)' }}>Priority</label>
                            <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className={`${fieldClass} ops-select w-full`}>
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass} style={{ color: 'var(--color-text-secondary)' }}>Start Date</label>
                            <input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className={fieldClass} />
                        </div>
                        <div>
                            <label className={labelClass} style={{ color: 'var(--color-text-secondary)' }}>End Date</label>
                            <input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} min={formData.start_date || undefined} className={fieldClass} />
                        </div>
                    </div>

                    <div>
                        <label className={labelClass} style={{ color: 'var(--color-text-secondary)' }}>Project Lead</label>
                        <select value={formData.team_lead} onChange={(e) => setFormData({ ...formData, team_lead: e.target.value, team_members: e.target.value ? [...new Set([...formData.team_members, e.target.value])] : formData.team_members })} className={`${fieldClass} ops-select w-full`}>
                            <option value="">No lead</option>
                            {currentWorkspace?.members?.map((member) => (
                                <option key={member.user.email} value={member.user.email}>{member.user.name} ({member.user.email})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className={labelClass} style={{ color: 'var(--color-text-secondary)' }}>Team Members</label>
                        <select className={`${fieldClass} ops-select w-full`} value="" onChange={(e) => {
                            if (e.target.value && !formData.team_members.includes(e.target.value)) {
                                setFormData((prev) => ({ ...prev, team_members: [...prev.team_members, e.target.value] }));
                            }
                        }}>
                            <option value="">Add team members</option>
                            {currentWorkspace?.members
                                ?.filter((m) => !formData.team_members.includes(m.user.email))
                                .map((member) => (
                                    <option key={member.user.email} value={member.user.email}>{member.user.name}</option>
                                ))}
                        </select>

                        {formData.team_members.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {formData.team_members.map((email) => (
                                    <div key={email} className="flex items-center gap-1 px-2 py-1 rounded-md text-sm" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--color-accent-primary)' }}>
                                        {email}
                                        <button type="button" onClick={() => removeTeamMember(email)} className="ml-1 hover:opacity-70"><XIcon className="w-3 h-3" /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setIsDialogOpen(false)} className="ops-btn-secondary">Cancel</button>
                        <button type="submit" disabled={isSubmitting || !currentWorkspace} className="ops-btn-primary">
                            {isSubmitting ? "Creating..." : "Create Project"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProjectDialog;
