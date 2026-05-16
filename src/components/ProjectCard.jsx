import { Link } from "react-router-dom";
import { Calendar, Users } from "lucide-react";
import { format } from "date-fns";

const statusConfig = {
    PLANNING: { dot: "var(--color-text-tertiary)", bg: "rgba(82, 82, 91, 0.15)", text: "var(--color-text-secondary)" },
    ACTIVE: { dot: "var(--color-status-success)", bg: "rgba(16, 185, 129, 0.15)", text: "var(--color-status-success)", pulse: true },
    ON_HOLD: { dot: "var(--color-status-warning)", bg: "rgba(245, 158, 11, 0.15)", text: "var(--color-status-warning)" },
    COMPLETED: { dot: "var(--color-status-info)", bg: "rgba(6, 182, 212, 0.15)", text: "var(--color-status-info)" },
    CANCELLED: { dot: "var(--color-status-danger)", bg: "rgba(239, 68, 68, 0.15)", text: "var(--color-status-danger)" },
};

const ProjectCard = ({ project }) => {
    const status = statusConfig[project.status] || statusConfig.PLANNING;

    return (
        <Link
            to={`/projectsDetail?id=${project.id}&tab=tasks`}
            className="ops-card ops-card-hover p-5 block group"
        >
            <div className="mb-3">
                <h3 className="font-semibold text-base mb-1 truncate transition-colors group-hover:text-[var(--color-accent-primary)]" style={{ color: 'var(--color-text-primary)' }}>
                    {project.name}
                </h3>
                <p className="text-sm line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                    {project.description || "No description"}
                </p>
            </div>

            <div className="flex items-center justify-between mb-4">
                <span className="ops-status-pill" style={{ background: status.bg, color: status.text }}>
                    <span className={status.pulse ? 'ops-status-dot-active' : 'ops-status-pill-dot'} style={!status.pulse ? { background: status.dot } : undefined} />
                    {project.status.replace("_", " ")}
                </span>
                <span className="text-xs capitalize" style={{ color: 'var(--color-text-tertiary)' }}>
                    {project.priority} priority
                </span>
            </div>

            {(project.members?.length > 0 || project.end_date) && (
                <div className="flex items-center gap-4 text-xs mb-4" style={{ color: 'var(--color-text-tertiary)' }}>
                    {project.members?.length > 0 && (
                        <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
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
            )}

            <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                    <span style={{ color: 'var(--color-text-tertiary)' }}>Progress</span>
                    <span style={{ color: 'var(--color-text-secondary)' }}>{project.progress || 0}%</span>
                </div>
                <div className="ops-progress-track">
                    <div className="ops-progress-fill" style={{ width: `${project.progress || 0}%` }} />
                </div>
            </div>
        </Link>
    );
};

export default ProjectCard;
