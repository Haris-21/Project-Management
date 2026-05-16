import { useEffect, useState } from 'react';
import { CheckSquareIcon, ChevronDownIcon, ChevronRightIcon } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

function MyTasksSidebar() {

    const user = { id: 'user_1' }; // matches CURRENT_USER.id

    const { currentWorkspace } = useSelector((state) => state.workspace);
    const [showMyTasks, setShowMyTasks] = useState(false);
    const [myTasks, setMyTasks] = useState([]);

    const getTaskStatusColor = (status) => {
        switch (status) {
            case 'DONE': return 'var(--color-status-success)';
            case 'IN_PROGRESS': return 'var(--color-status-warning)';
            default: return 'var(--color-text-tertiary)';
        }
    };

    const fetchUserTasks = () => {
        const userId = user?.id || '';
        if (!userId || !currentWorkspace) return;
        const currentWorkspaceTasks = currentWorkspace.projects.flatMap((project) => {
            return project.tasks.filter((task) => task?.assignee?.id === userId);
        });
        setMyTasks(currentWorkspaceTasks);
    }

    useEffect(() => {
        fetchUserTasks()
    }, [currentWorkspace])

    return (
        <div className="mt-4 px-3">
            <button
                type="button"
                onClick={() => setShowMyTasks(prev => !prev)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors hover:bg-white/5"
            >
                <div className="flex items-center gap-2">
                    <CheckSquareIcon className="w-4 h-4" style={{ color: 'var(--color-text-tertiary)' }} />
                    <h3 className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>My Tasks</h3>
                    <span className="ops-count-badge">{myTasks.length}</span>
                </div>
                {showMyTasks ? (
                    <ChevronDownIcon className="w-4 h-4" style={{ color: 'var(--color-text-tertiary)' }} />
                ) : (
                    <ChevronRightIcon className="w-4 h-4" style={{ color: 'var(--color-text-tertiary)' }} />
                )}
            </button>

            {showMyTasks && (
                <div className="mt-1 pl-2 space-y-0.5">
                    {myTasks.length === 0 ? (
                        <div className="px-3 py-2 text-xs text-center" style={{ color: 'var(--color-text-tertiary)' }}>
                            No tasks assigned
                        </div>
                    ) : (
                        myTasks.map((task, index) => (
                            <Link
                                key={index}
                                to={`/taskDetails?projectId=${task.projectId}&taskId=${task.id}`}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:bg-white/5"
                            >
                                <div
                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                    style={{ background: getTaskStatusColor(task.status) }}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                                        {task.title}
                                    </p>
                                    <p className="text-[11px] lowercase" style={{ color: 'var(--color-text-tertiary)' }}>
                                        {task.status.replace('_', ' ')}
                                    </p>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default MyTasksSidebar;
