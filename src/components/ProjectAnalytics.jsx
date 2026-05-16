import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { CheckCircle, Clock, AlertTriangle, Users } from "lucide-react";

const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];
const PRIORITY_BAR = {
    LOW: "var(--color-status-success)",
    MEDIUM: "var(--color-status-warning)",
    HIGH: "var(--color-status-danger)",
};

const ProjectAnalytics = ({ project, tasks }) => {
    const { stats, statusData, typeData, priorityData } = useMemo(() => {
        const now = new Date();
        const total = tasks.length;

        const stats = {
            total,
            completed: 0,
            inProgress: 0,
            todo: 0,
            overdue: 0,
        };

        const statusMap = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
        const typeMap = { TASK: 0, BUG: 0, FEATURE: 0, IMPROVEMENT: 0, OTHER: 0 };
        const priorityMap = { LOW: 0, MEDIUM: 0, HIGH: 0 };

        tasks.forEach((t) => {
            if (t.status === "DONE") stats.completed++;
            if (t.status === "IN_PROGRESS") stats.inProgress++;
            if (t.status === "TODO") stats.todo++;
            if (new Date(t.due_date) < now && t.status !== "DONE") stats.overdue++;

            if (statusMap[t.status] !== undefined) statusMap[t.status]++;
            if (typeMap[t.type] !== undefined) typeMap[t.type]++;
            if (priorityMap[t.priority] !== undefined) priorityMap[t.priority]++;
        });

        return {
            stats,
            statusData: Object.entries(statusMap).map(([k, v]) => ({ name: k.replace("_", " "), value: v })),
            typeData: Object.entries(typeMap).filter(([_, v]) => v > 0).map(([k, v]) => ({ name: k, value: v })),
            priorityData: Object.entries(priorityMap).map(([k, v]) => ({
                name: k,
                value: v,
                percentage: total > 0 ? Math.round((v / total) * 100) : 0,
            })),
        };
    }, [tasks]);

    const completionRate = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;

    const metrics = [
        { label: "Completion Rate", value: `${completionRate}%`, color: "var(--color-status-success)", icon: CheckCircle, iconBg: "rgba(16, 185, 129, 0.1)" },
        { label: "Active Tasks", value: stats.inProgress, color: "var(--color-accent-primary)", icon: Clock, iconBg: "rgba(99, 102, 241, 0.1)" },
        { label: "Overdue Tasks", value: stats.overdue, color: "var(--color-status-danger)", icon: AlertTriangle, iconBg: "rgba(239, 68, 68, 0.1)" },
        { label: "Team Size", value: project?.members?.length || 0, color: "var(--color-accent-secondary)", icon: Users, iconBg: "rgba(139, 92, 246, 0.1)" },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((m, i) => {
                    const Icon = m.icon;
                    return (
                        <div key={i} className="ops-stat-card">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="ops-stat-label">{m.label}</p>
                                    <p className="text-xl font-semibold tabular-nums" style={{ color: m.color }}>{m.value}</p>
                                </div>
                                <div className="ops-icon-box" style={{ background: m.iconBg }}>
                                    <Icon className="size-4" style={{ color: m.color }} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
                <section className="ops-card p-5">
                    <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Tasks by Status</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={statusData}>
                            <XAxis dataKey="name" tick={{ fill: "#52525B", fontSize: 12 }} axisLine={{ stroke: "rgba(255,255,255,0.06)" }} />
                            <YAxis tick={{ fill: "#52525B", fontSize: 12 }} axisLine={{ stroke: "rgba(255,255,255,0.06)" }} />
                            <Bar dataKey="value" fill="#6366F1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </section>

                <section className="ops-card p-5">
                    <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Tasks by Type</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ${value}`}>
                                {typeData.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </section>
            </div>

            <section className="ops-card p-5">
                <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Tasks by Priority</h2>
                <div className="space-y-4">
                    {priorityData.map((p) => (
                        <div key={p.name} className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm capitalize" style={{ color: 'var(--color-text-primary)' }}>{p.name.toLowerCase()}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{p.value} tasks</span>
                                    <span className="text-xs px-2 py-0.5 rounded" style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-tertiary)' }}>{p.percentage}%</span>
                                </div>
                            </div>
                            <div className="ops-progress-track h-1.5">
                                <div className="h-full rounded-full transition-all" style={{ width: `${p.percentage}%`, background: PRIORITY_BAR[p.name] }} />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default ProjectAnalytics;
