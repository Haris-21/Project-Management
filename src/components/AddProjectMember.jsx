import { useState } from "react";
import { UserPlus, XIcon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { addProjectMember } from "../features/workspaceSlice";

const AddProjectMember = ({ isDialogOpen, setIsDialogOpen }) => {
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const projectId = searchParams.get("id");
    const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace || null);
    const project = currentWorkspace?.projects.find((p) => p.id === projectId);
    const projectMemberIds = new Set((project?.members || []).map((m) => m.userId || m.user?.id));

    const [userId, setUserId] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    const availableMembers = (currentWorkspace?.members || []).filter(
        (m) => !projectMemberIds.has(m.userId) && !projectMemberIds.has(m.user?.id)
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!projectId || !userId) return;

        setIsAdding(true);
        try {
            dispatch(addProjectMember({ projectId, userId }));
            toast.success("Member added to project");
            setUserId("");
            setIsDialogOpen(false);
        } catch (err) {
            toast.error(err?.message || "Failed to add member");
        } finally {
            setIsAdding(false);
        }
    };

    if (!isDialogOpen || !project) return null;

    return (
        <div className="fixed inset-0 ops-modal-overlay flex items-center justify-center z-50 p-4" onClick={() => setIsDialogOpen(false)}>
            <div className="ops-modal p-6 w-full max-w-md relative" onClick={(e) => e.stopPropagation()}>
                <button type="button" onClick={() => setIsDialogOpen(false)} className="absolute top-4 right-4 p-1 rounded hover:bg-white/5" style={{ color: 'var(--color-text-tertiary)' }}>
                    <XIcon className="size-5" />
                </button>

                <div className="mb-5">
                    <h2 className="text-xl font-semibold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                        <UserPlus className="size-5" /> Add Member to Project
                    </h2>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                        Project: <span style={{ color: 'var(--color-accent-primary)' }}>{project.name}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium block mb-1" style={{ color: 'var(--color-text-secondary)' }}>Workspace member</label>
                        <select value={userId} onChange={(e) => setUserId(e.target.value)} className="ops-select w-full py-2 px-3" required>
                            <option value="">Select a member</option>
                            {availableMembers.map((member) => (
                                <option key={member.user.id} value={member.user.id}>
                                    {member.user.name} ({member.user.email})
                                </option>
                            ))}
                        </select>
                        {availableMembers.length === 0 && (
                            <p className="text-xs mt-2" style={{ color: 'var(--color-text-tertiary)' }}>All workspace members are already on this project.</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setIsDialogOpen(false)} className="ops-btn-secondary">Cancel</button>
                        <button type="submit" disabled={isAdding || !userId} className="ops-btn-primary">
                            {isAdding ? "Adding..." : "Add Member"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProjectMember;
