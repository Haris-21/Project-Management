import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, UsersIcon, FolderOpen } from "lucide-react";
import { format } from "date-fns";
import { useSelector } from "react-redux";
import CreateProjectDialog from "./CreateProjectDialog";

const statusConfig = {
    PLANNING: { dot: "var(--color-text-tertiary)", bg: "rgba(82, 82, 91, 0.15)", text: "var(--color-text-secondary)" },
    ACTIVE: { dot: "var(--color-status-success)", bg: "rgba(16, 185, 129, 0.15)", text: "var(--color-status-success)", pulse: true },
    ON_HOLD: { dot: "var(--color-status-warning)", bg: "rgba(245, 158, 11, 0.15)", text: "var(--color-status-warning)" },
    COMPLETED: { dot: "var(--color-status-info)", bg: "rgba(6, 182, 212, 0.15)", text: "var(--color-status-info)" },
    CANCELLED: { dot: "var(--color-status-danger)", bg: "rgba(239, 68, 68, 0.15)", text: "var(--color-status-danger)" },
};

const ProjectOverview = () => {
    const currentWorkspace = useSelector((state) => state?.workspace?.currentWorkspace || null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        setProjects(currentWorkspace?.projects || []);
    }, [currentWorkspace]);

    const formatStatus = (status) =>
        status.replace('_', ' ').replaceAll(/\b\w/g, c => c.toUpperCase());

    return currentWorkspace && (
        <section className="ops-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>Project Overview</h2>
                <Link
                    to="/projects"
                    className="text-sm flex items-center gap-1 transition-colors hover:opacity-80"
                    style={{ color: 'var(--color-accent-primary)' }}
                >
                    View all <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            {projects.length === 0 ? (
                <div className="ops-empty-state">
                    <div className="ops-empty-icon">
                        <FolderOpen size={28} />
                    </div>
                    <p className="font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>No projects yet</p>
                    <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>Create your first project to get started</p>
                    <button type="button" onClick={() => setIsDialogOpen(true)} className="ops-btn-primary">
                        Create your First Project
                    </button>
                    <CreateProjectDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
                </div>
            ) : (
                <div className="p-4 grid sm:grid-cols-2 gap-4">
                    {projects.slice(0, 4).map((project) => {
                        const status = statusConfig[project.status] || statusConfig.PLANNING;
                        return (
                            <Link
                                key={project.id}
                                to={`/projectsDetail?id=${project.id}&tab=tasks`}
                                className="ops-card ops-card-hover p-5 block"
                            >
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-semibold text-sm mb-1 truncate" style={{ color: 'var(--color-text-primary)' }}>
                                            {project.name}
                                        </h3>
                                        <p className="text-xs line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                                            {project.description || 'No description'}
                                        </p>
                                    </div>
                                    <span
                                        className="ops-status-pill flex-shrink-0"
                                        style={{ background: status.bg, color: status.text }}
                                    >
                                        <span className={status.pulse ? 'ops-status-dot-active' : 'ops-status-pill-dot'} style={!status.pulse ? { background: status.dot } : undefined} />
                                        {formatStatus(project.status)}
                                    </span>
                                </div>

                                <div className="flex items-center gap-4 text-xs mb-4" style={{ color: 'var(--color-text-tertiary)' }}>
                                    {project.members?.length > 0 && (
                                        <span className="flex items-center gap-1">
                                            <UsersIcon className="w-3 h-3" />
                                            {project.members.length} members
                                        </span>
                                    )}
                                    {project.end_date && (
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {format(new Date(project.end_date), "MMM d, yyyy")}
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <div className="flex items-center justify-between text-xs mb-1.5">
                                        <span style={{ color: 'var(--color-text-tertiary)' }}>Progress</span>
                                        <span style={{ color: 'var(--color-text-secondary)' }}>{project.progress || 0}%</span>
                                    </div>
                                    <div className="ops-progress-track">
                                        <div
                                            className="ops-progress-fill"
                                            style={{ width: `${project.progress || 0}%` }}
                                        />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </section>
    );
}

export default ProjectOverview;
