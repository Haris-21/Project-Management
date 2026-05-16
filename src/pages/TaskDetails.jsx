import { format } from "date-fns";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CalendarIcon, MessageCircle, PenIcon, ArrowLeft } from "lucide-react";
import { addComment } from "../features/workspaceSlice";
import { CURRENT_USER } from "../lib/currentUser";
import { createId } from "../lib/ids";

const TaskDetails = () => {
    const [searchParams] = useSearchParams();
    const projectId = searchParams.get("projectId");
    const taskId = searchParams.get("taskId");
    const dispatch = useDispatch();

    const { currentWorkspace } = useSelector((state) => state.workspace);
    const [newComment, setNewComment] = useState("");
    const [posting, setPosting] = useState(false);

    const project = currentWorkspace?.projects?.find((p) => p.id === projectId);
    const task = project?.tasks?.find((t) => t.id === taskId);
    const comments = task?.comments || [];

    useEffect(() => {
        if (!projectId || !taskId) return;
    }, [projectId, taskId, currentWorkspace]);

    const handleAddComment = async () => {
        if (!newComment.trim() || !task || !projectId) return;

        setPosting(true);
        try {
            const comment = {
                id: createId(),
                user: CURRENT_USER,
                content: newComment.trim(),
                createdAt: new Date().toISOString(),
            };
            dispatch(addComment({ projectId, taskId: task.id, comment }));
            setNewComment("");
            toast.success("Comment added");
        } catch (error) {
            toast.error(error?.message || "Failed to add comment");
        } finally {
            setPosting(false);
        }
    };

    if (!projectId || !taskId) {
        return (
            <div className="ops-empty-state py-16">
                <p style={{ color: 'var(--color-text-secondary)' }}>Invalid task link.</p>
                <Link to="/projects" className="ops-btn-primary mt-4 inline-flex">Back to Projects</Link>
            </div>
        );
    }

    if (!currentWorkspace) {
        return <div className="ops-skeleton h-48 w-full rounded-lg" />;
    }

    if (!task) {
        return (
            <div className="ops-empty-state py-16">
                <p className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>Task not found</p>
                <Link to={`/projectsDetail?id=${projectId}&tab=tasks`} className="ops-btn-secondary inline-flex items-center gap-2 mt-2">
                    <ArrowLeft className="size-4" /> Back to project
                </Link>
            </div>
        );
    }

    const isOverdue = new Date(task.due_date) < new Date() && task.status !== "DONE";

    return (
        <div className="max-w-[1400px] mx-auto space-y-4">
            <Link to={`/projectsDetail?id=${projectId}&tab=tasks`} className="inline-flex items-center gap-2 text-sm transition-colors hover:opacity-80" style={{ color: 'var(--color-text-secondary)' }}>
                <ArrowLeft className="size-4" /> Back to tasks
            </Link>

            <div className="flex flex-col-reverse lg:flex-row gap-6">
                <div className="w-full lg:w-2/3">
                    <section className="ops-card p-5 flex flex-col lg:min-h-[70vh]">
                        <h2 className="text-base font-semibold flex items-center gap-2 mb-4" style={{ color: 'var(--color-text-primary)' }}>
                            <MessageCircle className="size-5" style={{ color: 'var(--color-accent-primary)' }} />
                            Task Discussion ({comments.length})
                        </h2>

                        <div className="flex-1 overflow-y-auto no-scrollbar mb-4 min-h-[200px]">
                            {comments.length > 0 ? (
                                <div className="flex flex-col gap-4">
                                    {comments.map((comment) => (
                                        <div
                                            key={comment.id}
                                            className="p-4 rounded-lg max-w-[85%]"
                                            style={{
                                                background: 'var(--color-bg-tertiary)',
                                                border: '1px solid var(--color-border)',
                                                marginLeft: comment.user?.id === CURRENT_USER.id ? 'auto' : undefined,
                                            }}
                                        >
                                            <div className="flex items-center gap-2 mb-2 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                                                <img src={comment.user?.image} alt="" className="size-5 rounded-full" />
                                                <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{comment.user?.name}</span>
                                                <span>· {format(new Date(comment.createdAt), "dd MMM yyyy, HH:mm")}</span>
                                            </div>
                                            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{comment.content}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm py-8 text-center" style={{ color: 'var(--color-text-tertiary)' }}>No comments yet. Be the first!</p>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAddComment(); }}
                                placeholder="Write a comment... (Ctrl+Enter to post)"
                                className="ops-textarea flex-1"
                                rows={3}
                            />
                            <button type="button" onClick={handleAddComment} disabled={posting || !newComment.trim()} className="ops-btn-primary whitespace-nowrap">
                                {posting ? "Posting..." : "Post"}
                            </button>
                        </div>
                    </section>
                </div>

                <div className="w-full lg:w-1/3 flex flex-col gap-4">
                    <section className="ops-card p-5">
                        <h1 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>{task.title}</h1>
                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className="text-xs px-2 py-0.5 rounded-md font-medium" style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}>{task.status.replace("_", " ")}</span>
                            <span className="text-xs ops-type-badge" style={{ borderColor: 'var(--color-accent-primary)', color: 'var(--color-accent-primary)' }}>{task.type}</span>
                            <span className={`text-xs ${task.priority === 'HIGH' ? 'ops-priority-high' : task.priority === 'LOW' ? 'ops-priority-low' : 'ops-priority-medium'}`}>{task.priority}</span>
                        </div>
                        {task.description && (
                            <p className="text-sm leading-relaxed mb-4 pb-4 border-b" style={{ color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)' }}>{task.description}</p>
                        )}
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
                                <span style={{ color: 'var(--color-text-tertiary)' }}>Assignee</span>
                                <div className="flex items-center gap-2">
                                    {task.assignee ? (
                                        <>
                                            <span className="ops-avatar-initials">{task.assignee.name?.[0]}</span>
                                            <span style={{ color: 'var(--color-text-primary)' }}>{task.assignee.name}</span>
                                        </>
                                    ) : (
                                        <span style={{ color: 'var(--color-text-tertiary)' }}>Unassigned</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span style={{ color: 'var(--color-text-tertiary)' }}>Due date</span>
                                <span className="flex items-center gap-1.5" style={{ color: isOverdue ? 'var(--color-status-danger)' : 'var(--color-text-primary)' }}>
                                    <CalendarIcon className="size-4" />
                                    {format(new Date(task.due_date), "dd MMM yyyy")}
                                </span>
                            </div>
                        </div>
                    </section>

                    {project && (
                        <section className="ops-card p-5">
                            <p className="ops-section-label mb-3">Project</p>
                            <h2 className="text-base font-semibold flex items-center gap-2 mb-3" style={{ color: 'var(--color-text-primary)' }}>
                                <PenIcon className="size-4" style={{ color: 'var(--color-accent-primary)' }} />
                                {project.name}
                            </h2>
                            <div className="ops-progress-track mb-3">
                                <div className="ops-progress-fill" style={{ width: `${project.progress || 0}%` }} />
                            </div>
                            <div className="flex flex-wrap gap-3 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                                <span>Status: {project.status}</span>
                                <span>Progress: {project.progress}%</span>
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskDetails;
