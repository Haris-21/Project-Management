import { useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { ChevronRightIcon, SettingsIcon, KanbanIcon, ChartColumnIcon, CalendarIcon, ArrowRightIcon } from 'lucide-react';
import { useSelector } from 'react-redux';

const ProjectSidebar = () => {

    const location = useLocation();
    const [expandedProjects, setExpandedProjects] = useState(new Set());
    const [searchParams] = useSearchParams();

    const projects = useSelector(
        (state) => state?.workspace?.currentWorkspace?.projects || []
    );

    const getProjectSubItems = (projectId) => [
        { title: 'Tasks', icon: KanbanIcon, url: `/projectsDetail?id=${projectId}&tab=tasks` },
        { title: 'Analytics', icon: ChartColumnIcon, url: `/projectsDetail?id=${projectId}&tab=analytics` },
        { title: 'Calendar', icon: CalendarIcon, url: `/projectsDetail?id=${projectId}&tab=calendar` },
        { title: 'Settings', icon: SettingsIcon, url: `/projectsDetail?id=${projectId}&tab=settings` }
    ];

    const toggleProject = (id) => {
        const newSet = new Set(expandedProjects);
        newSet.has(id) ? newSet.delete(id) : newSet.add(id);
        setExpandedProjects(newSet);
    };

    return (
        <div className="mt-4 px-3">
            <div className="flex items-center justify-between px-3 py-2">
                <h3 className="ops-section-label">Projects</h3>
                <Link to="/projects">
                    <button type="button" className="size-6 rounded flex items-center justify-center transition-colors hover:bg-white/5" style={{ color: 'var(--color-text-tertiary)' }}>
                        <ArrowRightIcon className="size-3" />
                    </button>
                </Link>
            </div>

            <div className="space-y-0.5 mt-1">
                {projects.map((project) => (
                    <div key={project.id}>
                        <button
                            type="button"
                            onClick={() => toggleProject(project.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:bg-white/5 text-sm"
                            style={{ color: 'var(--color-text-secondary)' }}
                        >
                            <ChevronRightIcon
                                className={`size-3 flex-shrink-0 transition-transform duration-200 ${expandedProjects.has(project.id) ? 'rotate-90' : ''}`}
                                style={{ color: 'var(--color-text-tertiary)' }}
                            />
                            <span className="size-2 rounded-full flex-shrink-0" style={{ background: 'var(--color-accent-primary)' }} />
                            <span className="truncate">{project.name}</span>
                        </button>

                        {expandedProjects.has(project.id) && (
                            <div className="ml-4 mt-0.5 space-y-0.5 border-l pl-2" style={{ borderColor: 'var(--color-border)' }}>
                                {getProjectSubItems(project.id).map((subItem) => {
                                    const isActive =
                                        location.pathname === `/projectsDetail` &&
                                        searchParams.get('id') === project.id &&
                                        searchParams.get('tab') === subItem.title.toLowerCase();

                                    return (
                                        <Link
                                            key={subItem.title}
                                            to={subItem.url}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${isActive ? 'ops-nav-item-active' : ''}`}
                                            style={!isActive ? { color: 'var(--color-text-tertiary)' } : undefined}
                                        >
                                            <subItem.icon className="size-3" />
                                            {subItem.title}
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProjectSidebar;
