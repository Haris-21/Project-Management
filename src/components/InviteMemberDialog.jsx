import { useState } from "react";
import { Mail, UserPlus, XIcon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { inviteMember } from "../features/workspaceSlice";

const InviteMemberDialog = ({ isDialogOpen, setIsDialogOpen }) => {
    const dispatch = useDispatch();
    const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace || null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ email: "", role: "org:member" });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentWorkspace) return;

        const exists = currentWorkspace.members.some((m) => m.user.email.toLowerCase() === formData.email.toLowerCase());
        if (exists) {
            toast.error("Member already in workspace");
            return;
        }

        setIsSubmitting(true);
        try {
            dispatch(inviteMember({ email: formData.email.trim(), role: formData.role }));
            toast.success("Invitation sent successfully");
            setFormData({ email: "", role: "org:member" });
            setIsDialogOpen(false);
        } catch (err) {
            toast.error(err?.message || "Failed to invite member");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isDialogOpen) return null;

    return (
        <div className="fixed inset-0 ops-modal-overlay flex items-center justify-center z-50 p-4" onClick={() => setIsDialogOpen(false)}>
            <div className="ops-modal p-6 w-full max-w-md relative" onClick={(e) => e.stopPropagation()}>
                <button type="button" onClick={() => setIsDialogOpen(false)} className="absolute top-4 right-4 p-1 rounded hover:bg-white/5" style={{ color: 'var(--color-text-tertiary)' }}>
                    <XIcon className="size-5" />
                </button>

                <div className="mb-5">
                    <h2 className="text-xl font-semibold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                        <UserPlus className="size-5" /> Invite Team Member
                    </h2>
                    {currentWorkspace && (
                        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                            Inviting to: <span style={{ color: 'var(--color-accent-primary)' }}>{currentWorkspace.name}</span>
                        </p>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium block mb-1" style={{ color: 'var(--color-text-secondary)' }}>Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--color-text-tertiary)' }} />
                            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Enter email address" className="ops-input w-full pl-10 pr-4 py-2" required />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium block mb-1" style={{ color: 'var(--color-text-secondary)' }}>Role</label>
                        <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="ops-select w-full py-2 px-3">
                            <option value="org:member">Member</option>
                            <option value="org:admin">Admin</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setIsDialogOpen(false)} className="ops-btn-secondary">Cancel</button>
                        <button type="submit" disabled={isSubmitting || !currentWorkspace} className="ops-btn-primary">
                            {isSubmitting ? "Sending..." : "Send Invitation"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InviteMemberDialog;
