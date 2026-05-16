import { useMemo, useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { SearchIcon, FolderOpen, CheckSquare } from "lucide-react";

export default function GlobalSearch() {
    const navigate = useNavigate();
    const { currentWorkspace } = useSelector((state) => state.workspace);
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q || !currentWorkspace) return { projects: [], tasks: [] };

        const projects = currentWorkspace.projects
            .filter((p) =>
                p.name.toLowerCase().includes(q) ||
                p.description?.toLowerCase().includes(q)
            )
            .slice(0, 5);

        const tasks = currentWorkspace.projects
            .flatMap((p) => p.tasks.map((t) => ({ ...t, projectName: p.name })))
            .filter((t) =>
                t.title.toLowerCase().includes(q) ||
                t.description?.toLowerCase().includes(q)
            )
            .slice(0, 8);

        return { projects, tasks };
    }, [query, currentWorkspace]);

    const hasResults = results.projects.length > 0 || results.tasks.length > 0;
    const showDropdown = open && query.trim().length > 0;

    useEffect(() => {
        const onClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, []);

    const goProject = (id) => {
        navigate(`/projectsDetail?id=${id}&tab=tasks`);
        setQuery("");
        setOpen(false);
    };

    const goTask = (projectId, taskId) => {
        navigate(`/taskDetails?projectId=${projectId}&taskId=${taskId}`);
        setQuery("");
        setOpen(false);
    };

    return (
        <div ref={ref} className="relative flex-1 max-w-[380px]">
            <SearchIcon
                className="absolute left-3 top-1/2 -translate-y-1/2 size-4 pointer-events-none z-10"
                style={{ color: 'var(--color-text-tertiary)' }}
            />
            <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                onFocus={() => setOpen(true)}
                placeholder="Search projects, tasks..."
                className="ops-search w-full"
            />

            {showDropdown && (
                <div
                    className="absolute left-0 right-0 top-full mt-2 ops-card overflow-hidden z-50 max-h-80 overflow-y-auto"
                    style={{ boxShadow: 'var(--shadow-elevated)' }}
                >
                    {!hasResults ? (
                        <p className="px-4 py-6 text-sm text-center" style={{ color: 'var(--color-text-tertiary)' }}>
                            No results for &ldquo;{query}&rdquo;
                        </p>
                    ) : (
                        <>
                            {results.projects.length > 0 && (
                                <div className="p-2">
                                    <p className="ops-section-label px-2 py-1">Projects</p>
                                    {results.projects.map((p) => (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => goProject(p.id)}
                                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-white/5 transition-colors"
                                        >
                                            <FolderOpen className="size-4 flex-shrink-0" style={{ color: 'var(--color-accent-primary)' }} />
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{p.name}</p>
                                                <p className="text-xs truncate" style={{ color: 'var(--color-text-tertiary)' }}>{p.status}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                            {results.tasks.length > 0 && (
                                <div className="p-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                                    <p className="ops-section-label px-2 py-1">Tasks</p>
                                    {results.tasks.map((t) => (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => goTask(t.projectId, t.id)}
                                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-white/5 transition-colors"
                                        >
                                            <CheckSquare className="size-4 flex-shrink-0" style={{ color: 'var(--color-status-info)' }} />
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{t.title}</p>
                                                <p className="text-xs truncate" style={{ color: 'var(--color-text-tertiary)' }}>{t.projectName}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
