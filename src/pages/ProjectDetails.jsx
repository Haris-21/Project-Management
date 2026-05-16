import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeftIcon, PlusIcon, SettingsIcon, BarChart3Icon, CalendarIcon, FileStackIcon, ZapIcon } from "lucide-react";
import ProjectAnalytics from "../components/ProjectAnalytics";
import ProjectSettings from "../components/ProjectSettings";
import CreateTaskDialog from "../components/CreateTaskDialog";
import ProjectCalendar from "../components/ProjectCalendar";
import ProjectTasks from "../components/ProjectTasks";

export default function ProjectDetail() {

    const [searchParams, setSearchParams] = useSearchParams();
    const tab = searchParams.get('tab');
    const id = searchParams.get('id');

    const navigate = useNavigate();
    const projects = useSelector((state) => state?.workspace?.currentWorkspace?.projects || []);

    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [showCreateTask, setShowCreateTask] = useState(false);
    const [activeTab, setActiveTab] = useState(tab || "tasks");

    useEffect(() => {
        if (tab) setActiveTab(tab);
    }, [tab]);

    useEffect(() => {
        if (projects && projects.length > 0) {
            const proj = projects.find((p) => p.id === id);
            setProject(proj);
            setTasks(proj?.tasks || []);
        }
    }, [id, projects]);

    const statusConfig = {
        PLANNING: { bg: "rgba(82, 82, 91, 0.15)", text: "var(--color-text-secondary)" },
        ACTIVE: { bg: "rgba(16, 185, 129, 0.15)", text: "var(--color-status-success)" },
        ON_HOLD: { bg: "rgba(245, 158, 11, 0.15)", text: "var(--color-status-warning)" },
        COMPLETED: { bg: "rgba(6, 182, 212, 0.15)", text: "var(--color-status-info)" },
        CANCELLED: { bg: "rgba(239, 68, 68, 0.15)", text: "var(--color-status-danger)" },
    };

    if (!project) {
        return (
            <div className="ops-empty-state py-20">
                <p className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Project not found</p>
                <button type="button" onClick={() => navigate('/projects')} className="ops-btn-secondary">
                    Back to Projects
                </button>
            </div>
        );
    }

    const status = statusConfig[project.status] || statusConfig.PLANNING;

    const infoCards = [
        { label: "Total Tasks", value: tasks.length, color: "var(--color-text-primary)" },
        { label: "Completed", value: tasks.filter((t) => t.status === "DONE").length, color: "var(--color-status-success)" },
        { label: "In Progress", value: tasks.filter((t) => t.status === "IN_PROGRESS" || t.status === "TODO").length, color: "var(--color-status-warning)" },
        { label: "Team Members", value: project.members?.length || 0, color: "var(--color-accent-primary)" },
    ];

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto">
            <div className="flex max-md:flex-col gap-4 flex-wrap items-start justify-between">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        className="p-2 rounded-lg transition-colors hover:bg-white/5"
                        style={{ color: 'var(--color-text-secondary)' }}
                        onClick={() => navigate('/projects')}
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>{project.name}</h1>
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium capitalize" style={{ background: status.bg, color: status.text }}>
                            {project.status.replace("_", " ")}
                        </span>
                    </div>
                </div>
                <button type="button" onClick={() => setShowCreateTask(true)} className="ops-btn-primary flex items-center gap-2">
                    <PlusIcon className="size-4" /> New Task
                </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {infoCards.map((card) => (
                    <div key={card.label} className="ops-stat-card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="ops-stat-label">{card.label}</p>
                                <p className="text-2xl font-semibold tabular-nums" style={{ color: card.color }}>{card.value}</p>
                            </div>
                            <ZapIcon className="size-4 opacity-50" style={{ color: card.color }} />
                        </div>
                    </div>
                ))}
            </div>

            <div>
                <div className="flex flex-wrap gap-1 p-1 rounded-lg w-fit" style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
                    {[
                        { key: "tasks", label: "Tasks", icon: FileStackIcon },
                        { key: "calendar", label: "Calendar", icon: CalendarIcon },
                        { key: "analytics", label: "Analytics", icon: BarChart3Icon },
                        { key: "settings", label: "Settings", icon: SettingsIcon },
                    ].map((tabItem) => (
                        <button
                            key={tabItem.key}
                            type="button"
                            onClick={() => { setActiveTab(tabItem.key); setSearchParams({ id: id, tab: tabItem.key }) }}
                            className={`ops-tab-btn ${activeTab === tabItem.key ? 'ops-tab-btn-active' : ''}`}
                        >
                            <tabItem.icon className="size-3.5" />
                            {tabItem.label}
                        </button>
                    ))}
                </div>

                <div className="mt-6">
                    {activeTab === "tasks" && <ProjectTasks tasks={tasks} projectId={id} />}
                    {activeTab === "analytics" && <ProjectAnalytics tasks={tasks} project={project} />}
                    {activeTab === "calendar" && <ProjectCalendar tasks={tasks} />}
                    {activeTab === "settings" && <ProjectSettings project={project} />}
                </div>
            </div>

            {showCreateTask && <CreateTaskDialog showCreateTask={showCreateTask} setShowCreateTask={setShowCreateTask} projectId={id} />}
        </div>
    );
}
