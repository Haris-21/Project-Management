import { useState } from "react";
import { Calendar as CalendarIcon, XIcon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { addTask } from "../features/workspaceSlice";
import { createId } from "../lib/ids";

const initialForm = {
    title: "",
    description: "",
    type: "TASK",
    status: "TODO",
    priority: "MEDIUM",
    assigneeId: "",
    due_date: "",
};

export default function CreateTaskDialog({ showCreateTask, setShowCreateTask, projectId }) {
    const dispatch = useDispatch();
    const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace || null);
    const project = currentWorkspace?.projects.find((p) => p.id === projectId);
    const teamMembers = project?.members?.length
        ? project.members
        : (currentWorkspace?.members || []);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState(initialForm);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!projectId || !project) return;

        setIsSubmitting(true);
        try {
            const assignee = teamMembers.find((m) => m.user?.id === formData.assigneeId)?.user;
            const now = new Date().toISOString();
            const task = {
                id: createId(),
                projectId,
                title: formData.title.trim(),
                description: formData.description.trim(),
                status: formData.status,
                type: formData.type,
                priority: formData.priority,
                assigneeId: formData.assigneeId || null,
                due_date: formData.due_date ? new Date(formData.due_date).toISOString() : new Date(Date.now() + 7 * 86400000).toISOString(),
                createdAt: now,
                updatedAt: now,
                assignee: assignee || null,
                comments: [],
            };

            dispatch(addTask(task));
            toast.success("Task created successfully");
            setFormData(initialForm);
            setShowCreateTask(false);
        } catch (err) {
            toast.error(err?.message || "Failed to create task");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!showCreateTask) return null;

    const labelClass = "text-sm font-medium block mb-1";
    const fieldClass = "ops-input w-full px-3 py-2";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center ops-modal-overlay p-4" onClick={() => setShowCreateTask(false)}>
            <div className="ops-modal w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <button type="button" onClick={() => setShowCreateTask(false)} className="absolute top-4 right-4 p-1 rounded hover:bg-white/5" style={{ color: 'var(--color-text-tertiary)' }}>
                    <XIcon className="size-5" />
                </button>
                <h2 className="text-xl font-semibold mb-5" style={{ color: 'var(--color-text-primary)' }}>Create New Task</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className={labelClass} style={{ color: 'var(--color-text-secondary)' }}>Title</label>
                        <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Task title" className={fieldClass} required />
                    </div>
                    <div>
                        <label className={labelClass} style={{ color: 'var(--color-text-secondary)' }}>Description</label>
                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe the task" className={`${fieldClass} h-24 resize-none`} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass} style={{ color: 'var(--color-text-secondary)' }}>Type</label>
                            <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className={`${fieldClass} ops-select w-full`}>
                                <option value="BUG">Bug</option>
                                <option value="FEATURE">Feature</option>
                                <option value="TASK">Task</option>
                                <option value="IMPROVEMENT">Improvement</option>
                                <option value="OTHER">Other</option>
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
                            <label className={labelClass} style={{ color: 'var(--color-text-secondary)' }}>Assignee</label>
                            <select value={formData.assigneeId} onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })} className={`${fieldClass} ops-select w-full`}>
                                <option value="">Unassigned</option>
                                {teamMembers.map((member) => (
                                    <option key={member?.user?.id} value={member?.user?.id}>{member?.user?.name || member?.user?.email}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass} style={{ color: 'var(--color-text-secondary)' }}>Status</label>
                            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={`${fieldClass} ops-select w-full`}>
                                <option value="TODO">To Do</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="DONE">Done</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className={labelClass} style={{ color: 'var(--color-text-secondary)' }}>Due Date</label>
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="size-4 flex-shrink-0" style={{ color: 'var(--color-text-tertiary)' }} />
                            <input type="date" value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} className={fieldClass} required />
                        </div>
                        {formData.due_date && (
                            <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>{format(new Date(formData.due_date), "PPP")}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setShowCreateTask(false)} className="ops-btn-secondary">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="ops-btn-primary">
                            {isSubmitting ? "Creating..." : "Create Task"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
