import { FolderOpen, CheckCircle, Users, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function StatsGrid() {
    const currentWorkspace = useSelector(
        (state) => state?.workspace?.currentWorkspace || null
    );

    const [stats, setStats] = useState({
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        myTasks: 0,
        overdueIssues: 0,
    });

    const statCards = [
        {
            icon: FolderOpen,
            title: "Total Projects",
            value: stats.totalProjects,
            subtitle: `projects in ${currentWorkspace?.name}`,
            iconBg: "rgba(99, 102, 241, 0.1)",
            iconColor: "var(--color-accent-primary)",
            glowColor: "rgba(99, 102, 241, 0.15)",
        },
        {
            icon: CheckCircle,
            title: "Completed Projects",
            value: stats.completedProjects,
            subtitle: `completed of ${stats.totalProjects}`,
            iconBg: "rgba(16, 185, 129, 0.1)",
            iconColor: "var(--color-status-success)",
            glowColor: "rgba(16, 185, 129, 0.15)",
        },
        {
            icon: Users,
            title: "My Tasks",
            value: stats.myTasks,
            subtitle: "assigned to me",
            iconBg: "rgba(139, 92, 246, 0.1)",
            iconColor: "var(--color-accent-secondary)",
            glowColor: "rgba(139, 92, 246, 0.15)",
        },
        {
            icon: AlertTriangle,
            title: "Overdue",
            value: stats.overdueIssues,
            subtitle: "need attention",
            iconBg: "rgba(245, 158, 11, 0.1)",
            iconColor: "var(--color-status-warning)",
            glowColor: "rgba(245, 158, 11, 0.15)",
        },
    ];

    useEffect(() => {
        if (currentWorkspace) {
            setStats({
                totalProjects: currentWorkspace.projects.length,
                activeProjects: currentWorkspace.projects.filter(
                    (p) => p.status !== "CANCELLED" && p.status !== "COMPLETED"
                ).length,
                completedProjects: currentWorkspace.projects.filter((p) => p.status === "COMPLETED").length,
                myTasks: currentWorkspace.projects.reduce(
                    (acc, project) =>
                        acc + project.tasks.filter((t) => t.assigneeId === "user_1" || t.assignee?.id === "user_1").length,
                    0
                ),
                overdueIssues: currentWorkspace.projects.reduce(
                    (acc, project) =>
                        acc + project.tasks.filter((t) => new Date(t.due_date) < new Date() && t.status !== "DONE").length,
                    0
                ),
            });
        }
    }, [currentWorkspace]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 my-8">
            {statCards.map(({ icon: Icon, title, value, subtitle, iconBg, iconColor, glowColor }, i) => (
                <div
                    key={i}
                    className="ops-stat-card group"
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 8px 24px ${glowColor}`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-card)'; }}
                >
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="ops-stat-label mb-1">{title}</p>
                            <p className="ops-stat-value">{value}</p>
                            {subtitle && (
                                <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>{subtitle}</p>
                            )}
                        </div>
                        <div className="ops-icon-box" style={{ background: iconBg }}>
                            <Icon size={18} style={{ color: iconColor }} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
