import { useEffect, useState } from "react";
import { ArrowRight, Clock, AlertTriangle, User } from "lucide-react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { CURRENT_USER } from "../lib/currentUser";

const panelConfig = {
    "My Tasks": {
        icon: User,
        badgeBg: "rgba(16, 185, 129, 0.15)",
        badgeColor: "var(--color-status-success)",
        borderColor: "var(--color-status-success)",
    },
    "Overdue": {
        icon: AlertTriangle,
        badgeBg: "rgba(239, 68, 68, 0.15)",
        badgeColor: "var(--color-status-danger)",
        borderColor: "var(--color-status-danger)",
    },
    "In Progress": {
        icon: Clock,
        badgeBg: "rgba(245, 158, 11, 0.15)",
        badgeColor: "var(--color-status-warning)",
        borderColor: "var(--color-status-warning)",
    },
};

const priorityBorder = {
    HIGH: "var(--color-status-danger)",
    MEDIUM: "var(--color-status-warning)",
    LOW: "var(--color-status-success)",
};

export default function TasksSummary() {
    const { currentWorkspace } = useSelector((state) => state.workspace);
    const user = CURRENT_USER
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        if (currentWorkspace) {
            setTasks(currentWorkspace.projects.flatMap((project) => project.tasks));
        }
    }, [currentWorkspace]);

    const myTasks = tasks.filter((t) => t.assigneeId === user.id || t.assignee?.id === user.id);
    const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'DONE');
    const inProgressIssues = tasks.filter(i => i.status === 'IN_PROGRESS');

    const summaryCards = [
        { title: "My Tasks", count: myTasks.length, items: myTasks.slice(0, 3) },
        { title: "Overdue", count: overdueTasks.length, items: overdueTasks.slice(0, 3) },
        { title: "In Progress", count: inProgressIssues.length, items: inProgressIssues.slice(0, 3) },
    ];

    return (
        <div className="space-y-4">
            {summaryCards.map((card) => {
                const config = panelConfig[card.title];
                const Icon = config.icon;
                return (
                    <div key={card.title} className="ops-panel">
                        <div className="ops-panel-header">
                            <div className="ops-icon-box" style={{ background: 'var(--color-bg-tertiary)' }}>
                                <Icon className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
                            </div>
                            <h3 className="text-sm font-medium flex-1" style={{ color: 'var(--color-text-primary)' }}>{card.title}</h3>
                            <span
                                className="text-xs font-semibold px-2 py-0.5 rounded-full tabular-nums"
                                style={{ background: config.badgeBg, color: config.badgeColor }}
                            >
                                {card.count}
                            </span>
                        </div>

                        {card.items.length === 0 ? (
                            <p className="text-sm text-center py-6" style={{ color: 'var(--color-text-tertiary)' }}>
                                No {card.title.toLowerCase()}
                            </p>
                        ) : (
                            <div className="space-y-1">
                                {card.items.map((issue) => (
                                    <Link
                                        key={issue.id}
                                        to={`/taskDetails?projectId=${issue.projectId}&taskId=${issue.id}`}
                                        className="ops-task-item cursor-pointer block"
                                        style={{ borderLeftColor: priorityBorder[issue.priority] || config.borderColor }}
                                    >
                                        <h4 className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                                            {issue.title}
                                        </h4>
                                        <p className="text-xs capitalize mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
                                            {issue.type} · {issue.priority} priority
                                        </p>
                                    </Link>
                                ))}
                                {card.count > 3 && (
                                    <button type="button" className="flex items-center justify-center w-full text-xs py-2 mt-1 transition-colors hover:opacity-80" style={{ color: 'var(--color-text-tertiary)' }}>
                                        View {card.count - 3} more <ArrowRight className="w-3 h-3 ml-1" />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
