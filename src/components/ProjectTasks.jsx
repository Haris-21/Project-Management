import { format } from "date-fns";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { deleteTask, updateTask } from "../features/workspaceSlice";
import { Bug, CalendarIcon, GitCommit, MessageSquare, Square, Trash, XIcon, Zap, Pencil } from "lucide-react";

const typeIcons = {
    BUG: { icon: Bug, color: "var(--color-status-danger)", border: "rgba(239, 68, 68, 0.4)" },
    FEATURE: { icon: Zap, color: "var(--color-accent-primary)", border: "rgba(99, 102, 241, 0.4)" },
    TASK: { icon: Square, color: "var(--color-status-success)", border: "rgba(16, 185, 129, 0.4)" },
    IMPROVEMENT: { icon: GitCommit, color: "var(--color-accent-secondary)", border: "rgba(139, 92, 246, 0.4)" },
    OTHER: { icon: MessageSquare, color: "var(--color-status-warning)", border: "rgba(245, 158, 11, 0.4)" },
};

const priorityClass = {
    LOW: "ops-priority-low",
    MEDIUM: "ops-priority-medium",
    HIGH: "ops-priority-high",
};

const ProjectTasks = ({ tasks, projectId }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [selectedTasks, setSelectedTasks] = useState([]);

    const [filters, setFilters] = useState({
        status: "",
        type: "",
        priority: "",
        assignee: "",
    });

    const assigneeList = useMemo(
        () => Array.from(new Set(tasks.map((t) => t.assignee?.name).filter(Boolean))),
        [tasks]
    );

    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const { status, type, priority, assignee } = filters;
            return (
                (!status || task.status === status) &&
                (!type || task.type === type) &&
                (!priority || task.priority === priority) &&
                (!assignee || task.assignee?.name === assignee)
            );
        });
    }, [filters, tasks]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleStatusChange = (taskId, newStatus) => {
        const task = tasks.find((t) => t.id === taskId);
        if (!task) return;
        dispatch(updateTask({ ...task, status: newStatus, projectId: task.projectId || projectId }));
        toast.success("Status updated");
    };

    const handleDelete = (taskIds = selectedTasks) => {
        if (!taskIds.length) return;
        if (!window.confirm(`Delete ${taskIds.length} task(s)?`)) return;
        dispatch(deleteTask({ projectId, taskIds }));
        setSelectedTasks((prev) => prev.filter((id) => !taskIds.includes(id)));
        toast.success("Task(s) deleted");
    };

    const isOverdue = (task) => new Date(task.due_date) < new Date() && task.status !== 'DONE';

    return (
        <div>
            <div className="flex flex-wrap gap-3 mb-4">
                {["status", "type", "priority", "assignee"].map((name) => {
                    const options = {
                        status: [
                            { label: "All Statuses", value: "" },
                            { label: "To Do", value: "TODO" },
                            { label: "In Progress", value: "IN_PROGRESS" },
                            { label: "Done", value: "DONE" },
                        ],
                        type: [
                            { label: "All Types", value: "" },
                            { label: "Task", value: "TASK" },
                            { label: "Bug", value: "BUG" },
                            { label: "Feature", value: "FEATURE" },
                            { label: "Improvement", value: "IMPROVEMENT" },
                            { label: "Other", value: "OTHER" },
                        ],
                        priority: [
                            { label: "All Priorities", value: "" },
                            { label: "Low", value: "LOW" },
                            { label: "Medium", value: "MEDIUM" },
                            { label: "High", value: "HIGH" },
                        ],
                        assignee: [
                            { label: "All Assignees", value: "" },
                            ...assigneeList.map((n) => ({ label: n, value: n })),
                        ],
                    };
                    return (
                        <select key={name} name={name} onChange={handleFilterChange} className="ops-select">
                            {options[name].map((opt, idx) => (
                                <option key={idx} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    );
                })}

                {(filters.status || filters.type || filters.priority || filters.assignee) && (
                    <button type="button" onClick={() => setFilters({ status: "", type: "", priority: "", assignee: "" })} className="ops-btn-secondary flex items-center gap-2 py-1.5">
                        <XIcon className="size-3" /> Reset
                    </button>
                )}

                {selectedTasks.length > 0 && (
                    <button type="button" onClick={handleDelete} className="ops-btn-danger flex items-center gap-2 py-1.5">
                        <Trash className="size-3" /> Delete
                    </button>
                )}
            </div>

            <div className="ops-card overflow-hidden">
                <div className="hidden lg:block overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b" style={{ borderColor: 'var(--color-border)' }}>
                                <th className="pl-4 pr-1 py-3 w-8">
                                    <input
                                        onChange={() => selectedTasks.length > 1 ? setSelectedTasks([]) : setSelectedTasks(tasks.map((t) => t.id))}
                                        checked={selectedTasks.length === tasks.length && tasks.length > 0}
                                        type="checkbox"
                                    />
                                </th>
                                <th className="ops-table-header">Title</th>
                                <th className="ops-table-header">Type</th>
                                <th className="ops-table-header">Priority</th>
                                <th className="ops-table-header">Status</th>
                                <th className="ops-table-header">Assignee</th>
                                <th className="ops-table-header">Due Date</th>
                                <th className="ops-table-header w-20" />
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTasks.length > 0 ? (
                                filteredTasks.map((task) => {
                                    const { icon: Icon, color, border } = typeIcons[task.type] || {};
                                    const overdue = isOverdue(task);

                                    return (
                                        <tr
                                            key={task.id}
                                            onClick={() => navigate(`/taskDetails?projectId=${task.projectId}&taskId=${task.id}`)}
                                            className="ops-table-row group"
                                        >
                                            <td onClick={e => e.stopPropagation()} className="pl-4 pr-1 py-3">
                                                <input
                                                    type="checkbox"
                                                    onChange={() => selectedTasks.includes(task.id) ? setSelectedTasks(selectedTasks.filter((i) => i !== task.id)) : setSelectedTasks((prev) => [...prev, task.id])}
                                                    checked={selectedTasks.includes(task.id)}
                                                />
                                            </td>
                                            <td className="px-4 py-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>{task.title}</td>
                                            <td className="px-4 py-3">
                                                <span className="ops-type-badge flex items-center gap-1.5 w-fit" style={{ borderColor: border, color }}>
                                                    {Icon && <Icon className="size-3" />}
                                                    {task.type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={priorityClass[task.priority] || 'ops-priority-medium'}>{task.priority}</span>
                                            </td>
                                            <td onClick={e => e.stopPropagation()} className="px-4 py-3">
                                                <select
                                                    name="status"
                                                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                                    value={task.status}
                                                    className="ops-select text-xs py-1"
                                                >
                                                    <option value="TODO">To Do</option>
                                                    <option value="IN_PROGRESS">In Progress</option>
                                                    <option value="DONE">Done</option>
                                                </select>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    {task.assignee ? (
                                                        <>
                                                            <span className="ops-avatar-initials">
                                                                {task.assignee.name?.[0]?.toUpperCase() || "?"}
                                                            </span>
                                                            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{task.assignee.name}</span>
                                                        </>
                                                    ) : (
                                                        <span style={{ color: 'var(--color-text-tertiary)' }}>—</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5 text-sm" style={{ color: overdue ? 'var(--color-status-danger)' : 'var(--color-text-tertiary)' }}>
                                                    <CalendarIcon className="size-4" />
                                                    {format(new Date(task.due_date), "dd MMM yyyy")}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); navigate(`/taskDetails?projectId=${task.projectId}&taskId=${task.id}`); }}
                                                        className="p-1.5 rounded hover:bg-white/5"
                                                        style={{ color: 'var(--color-text-tertiary)' }}
                                                    >
                                                        <Pencil className="size-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); handleDelete([task.id]); }}
                                                        className="p-1.5 rounded hover:bg-red-500/10"
                                                        style={{ color: 'var(--color-status-danger)' }}
                                                    >
                                                        <Trash className="size-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center py-10 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                                        No tasks found for the selected filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="lg:hidden flex flex-col gap-3 p-4">
                    {filteredTasks.length > 0 ? (
                        filteredTasks.map((task) => {
                            const { icon: Icon, color, border } = typeIcons[task.type] || {};
                            const overdue = isOverdue(task);
                            return (
                                <div
                                    key={task.id}
                                    onClick={() => navigate(`/taskDetails?projectId=${task.projectId}&taskId=${task.id}`)}
                                    className="ops-card p-4 cursor-pointer space-y-3"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{task.title}</h3>
                                        <input
                                            type="checkbox"
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={() => selectedTasks.includes(task.id) ? setSelectedTasks(selectedTasks.filter((i) => i !== task.id)) : setSelectedTasks((prev) => [...prev, task.id])}
                                            checked={selectedTasks.includes(task.id)}
                                        />
                                    </div>
                                    <span className="ops-type-badge inline-flex items-center gap-1" style={{ borderColor: border, color }}>
                                        {Icon && <Icon className="size-3" />}{task.type}
                                    </span>
                                    <span className={priorityClass[task.priority]}>{task.priority}</span>
                                    <select
                                        name="status"
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                        value={task.status}
                                        className="ops-select w-full"
                                    >
                                        <option value="TODO">To Do</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                        <option value="DONE">Done</option>
                                    </select>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="ops-avatar-initials">{task.assignee?.name?.[0] || "?"}</span>
                                        {task.assignee?.name || "Unassigned"}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm" style={{ color: overdue ? 'var(--color-status-danger)' : 'var(--color-text-tertiary)' }}>
                                        <CalendarIcon className="size-4" />
                                        {format(new Date(task.due_date), "dd MMM yyyy")}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-center py-6 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>No tasks found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectTasks;
