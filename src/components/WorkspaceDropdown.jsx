import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Plus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentWorkspace } from "../features/workspaceSlice";
import { useNavigate } from "react-router-dom";
import { addWorkspace } from "../features/workspaceSlice";
import { assets } from "../assets/assets";
import { createId } from "../lib/ids";
import toast from "react-hot-toast";

function WorkspaceDropdown() {

    const { workspaces } = useSelector((state) => state.workspace);
    const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace || null);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const onSelectWorkspace = (organizationId) => {
        dispatch(setCurrentWorkspace(organizationId))
        setIsOpen(false);
        navigate('/')
    }

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative px-3 py-3 border-b" style={{ borderColor: 'var(--color-border)' }} ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(prev => !prev)}
                className="w-full flex items-center justify-between p-2 rounded-lg transition-colors hover:bg-white/5"
            >
                <div className="flex items-center gap-3 min-w-0">
                    <img src={currentWorkspace?.image_url} alt={currentWorkspace?.name} className="w-8 h-8 rounded-lg object-cover" style={{ boxShadow: 'var(--shadow-card)' }} />
                    <div className="min-w-0 flex-1 text-left">
                        <p className="font-medium text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>
                            {currentWorkspace?.name || "Select Workspace"}
                        </p>
                        <p className="text-xs truncate" style={{ color: 'var(--color-text-tertiary)' }}>
                            {workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
                <ChevronDown className="w-4 h-4 flex-shrink-0 transition-transform" style={{ color: 'var(--color-text-tertiary)', transform: isOpen ? 'rotate(180deg)' : undefined }} />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-[calc(100%-24px)] ops-card mt-1 left-3 top-full overflow-hidden" style={{ boxShadow: 'var(--shadow-elevated)' }}>
                    <div className="p-2">
                        <p className="ops-section-label px-2 mb-2">Workspaces</p>
                        {workspaces.map((ws) => (
                            <div
                                key={ws.id}
                                role="button"
                                tabIndex={0}
                                onClick={() => onSelectWorkspace(ws.id)}
                                onKeyDown={(e) => e.key === 'Enter' && onSelectWorkspace(ws.id)}
                                className="flex items-center gap-3 p-2 cursor-pointer rounded-lg transition-colors hover:bg-white/5"
                            >
                                <img src={ws.image_url} alt={ws.name} className="w-6 h-6 rounded object-cover" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{ws.name}</p>
                                    <p className="text-xs truncate" style={{ color: 'var(--color-text-tertiary)' }}>{ws.members?.length || 0} members</p>
                                </div>
                                {currentWorkspace?.id === ws.id && (
                                    <Check className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-accent-primary)' }} />
                                )}
                            </div>
                        ))}
                    </div>

                    <hr style={{ borderColor: 'var(--color-border)' }} />

                    <button
                        type="button"
                        className="w-full p-2 text-left rounded-lg hover:bg-white/5"
                        onClick={() => {
                            const name = window.prompt("Workspace name");
                            if (!name?.trim()) return;
                            dispatch(addWorkspace({
                                id: createId(),
                                name: name.trim(),
                                slug: name.trim().toLowerCase().replace(/\s+/g, "-"),
                                description: null,
                                settings: {},
                                ownerId: "user_1",
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                                image_url: assets.workspace_img_default,
                                members: [],
                                projects: [],
                            }));
                            toast.success("Workspace created");
                            setIsOpen(false);
                        }}
                    >
                        <p className="flex items-center text-xs gap-2 px-2 py-1 font-medium" style={{ color: 'var(--color-accent-primary)' }}>
                            <Plus className="w-4 h-4" /> Create Workspace
                        </p>
                    </button>
                </div>
            )}
        </div>
    );
}

export default WorkspaceDropdown;
