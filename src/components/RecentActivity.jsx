import { useEffect, useState } from "react";
import { GitCommit, MessageSquare, Clock, Bug, Zap, Square } from "lucide-react";
import { format } from "date-fns";
import { useSelector } from "react-redux";

const typeIcons = {
    BUG: { icon: Bug, color: "var(--color-status-danger)" },
    FEATURE: { icon: Zap, color: "var(--color-accent-primary)" },
    TASK: { icon: Square, color: "var(--color-status-success)" },
    IMPROVEMENT: { icon: MessageSquare, color: "var(--color-status-warning)" },
    OTHER: { icon: GitCommit, color: "var(--color-accent-secondary)" },
};

const statusStyles = {
    TODO: { outline: true, border: "var(--color-text-tertiary)", text: "var(--color-text-secondary)" },
    IN_PROGRESS: { filled: true, bg: "rgba(245, 158, 11, 0.15)", text: "var(--color-status-warning)" },
    DONE: { filled: true, bg: "rgba(16, 185, 129, 0.15)", text: "var(--color-status-success)" },
};

const RecentActivity = () => {
    const [tasks, setTasks] = useState([]);
    const { currentWorkspace } = useSelector((state) => state.workspace);

    useEffect(() => {
        if (!currentWorkspace) return;
        const allTasks = currentWorkspace.projects
            .flatMap((project) => project.tasks.map((task) => task))
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, 12);
        setTasks(allTasks);
    }, [currentWorkspace]);

    return (
        <section className="ops-card overflow-hidden">
            <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>Recent Activity</h2>
            </div>

            {tasks.length === 0 ? (
                <div className="ops-empty-state py-12">
                    <div className="ops-empty-icon">
                        <Clock size={28} />
                    </div>
                    <p style={{ color: 'var(--color-text-secondary)' }}>No recent activity</p>
                </div>
            ) : (
                <div className="py-2">
                    {tasks.map((task, index) => {
                        const TypeIcon = typeIcons[task.type]?.icon || Square;
                        const iconColor = typeIcons[task.type]?.color || "var(--color-text-tertiary)";
                        const statusStyle = statusStyles[task.status] || statusStyles.TODO;
                        const isLast = index === tasks.length - 1;

                        return (
                            <div
                                key={task.id}
                                className="relative px-5 py-4 transition-colors hover:bg-white/[0.02]"
                            >
                                {!isLast && <div className="ops-activity-line" />}
                                <div className="flex items-start gap-4 relative">
                                    <div
                                        className="size-9 rounded-lg flex items-center justify-center flex-shrink-0 z-10"
                                        style={{ background: 'var(--color-bg-tertiary)' }}
                                    >
                                        <TypeIcon className="w-4 h-4" style={{ color: iconColor }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-3 mb-1.5">
                                            <h4 className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                                                {task.title}
                                            </h4>
                                            <span
                                                className="text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-medium"
                                                style={
                                                    statusStyle.filled
                                                        ? { background: statusStyle.bg, color: statusStyle.text }
                                                        : { border: `1px solid ${statusStyle.border}`, color: statusStyle.text }
                                                }
                                            >
                                                {task.status.replace("_", " ")}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                                            <span className="capitalize">{task.type.toLowerCase()}</span>
                                            {task.assignee && (
                                                <span className="flex items-center gap-1.5">
                                                    <span className="ops-avatar-initials text-[10px] w-5 h-5">
                                                        {task.assignee.name[0].toUpperCase()}
                                                    </span>
                                                    {task.assignee.name}
                                                </span>
                                            )}
                                            <span>{format(new Date(task.updatedAt), "MMM d, h:mm a")}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
};

export default RecentActivity;
