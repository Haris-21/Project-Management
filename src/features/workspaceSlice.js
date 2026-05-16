import { createSlice } from "@reduxjs/toolkit";
import { dummyWorkspaces, dummyUsers, assets } from "../assets/assets";

const storedId = typeof localStorage !== "undefined" ? localStorage.getItem("currentWorkspaceId") : null;
const defaultWorkspace = dummyWorkspaces.find((w) => w.id === storedId) || dummyWorkspaces[1] || dummyWorkspaces[0];

const calcProgress = (tasks = []) => {
    if (!tasks.length) return 0;
    return Math.round((tasks.filter((t) => t.status === "DONE").length / tasks.length) * 100);
};

const syncCurrentToWorkspaces = (state) => {
    if (!state.currentWorkspace) return;
    state.workspaces = state.workspaces.map((w) =>
        w.id === state.currentWorkspace.id ? state.currentWorkspace : w
    );
};

const initialState = {
    workspaces: dummyWorkspaces || [],
    currentWorkspace: defaultWorkspace,
    loading: false,
};

const workspaceSlice = createSlice({
    name: "workspace",
    initialState,
    reducers: {
        setWorkspaces: (state, action) => {
            state.workspaces = action.payload;
        },
        setCurrentWorkspace: (state, action) => {
            localStorage.setItem("currentWorkspaceId", action.payload);
            state.currentWorkspace = state.workspaces.find((w) => w.id === action.payload) || state.currentWorkspace;
        },
        addWorkspace: (state, action) => {
            state.workspaces.push(action.payload);
            state.currentWorkspace = action.payload;
            localStorage.setItem("currentWorkspaceId", action.payload.id);
        },
        updateWorkspace: (state, action) => {
            state.workspaces = state.workspaces.map((w) =>
                w.id === action.payload.id ? action.payload : w
            );
            if (state.currentWorkspace?.id === action.payload.id) {
                state.currentWorkspace = action.payload;
            }
        },
        deleteWorkspace: (state, action) => {
            state.workspaces = state.workspaces.filter((w) => w.id !== action.payload);
            if (state.currentWorkspace?.id === action.payload) {
                state.currentWorkspace = state.workspaces[0] || null;
                if (state.currentWorkspace) {
                    localStorage.setItem("currentWorkspaceId", state.currentWorkspace.id);
                }
            }
        },
        addProject: (state, action) => {
            const project = { ...action.payload, tasks: action.payload.tasks || [] };
            state.currentWorkspace.projects.push(project);
            syncCurrentToWorkspaces(state);
        },
        updateProject: (state, action) => {
            const project = action.payload;
            state.currentWorkspace.projects = state.currentWorkspace.projects.map((p) =>
                p.id === project.id ? { ...p, ...project } : p
            );
            syncCurrentToWorkspaces(state);
        },
        addTask: (state, action) => {
            const task = action.payload;
            state.currentWorkspace.projects = state.currentWorkspace.projects.map((p) => {
                if (p.id !== task.projectId) return p;
                const tasks = [...p.tasks, task];
                return { ...p, tasks, progress: calcProgress(tasks) };
            });
            syncCurrentToWorkspaces(state);
        },
        updateTask: (state, action) => {
            const task = action.payload;
            state.currentWorkspace.projects = state.currentWorkspace.projects.map((p) => {
                if (p.id !== task.projectId) return p;
                const tasks = p.tasks.map((t) => (t.id === task.id ? { ...t, ...task, updatedAt: new Date().toISOString() } : t));
                return { ...p, tasks, progress: calcProgress(tasks) };
            });
            syncCurrentToWorkspaces(state);
        },
        deleteTask: (state, action) => {
            const { projectId, taskIds } = action.payload;
            state.currentWorkspace.projects = state.currentWorkspace.projects.map((p) => {
                if (p.id !== projectId) return p;
                const tasks = p.tasks.filter((t) => !taskIds.includes(t.id));
                return { ...p, tasks, progress: calcProgress(tasks) };
            });
            syncCurrentToWorkspaces(state);
        },
        inviteMember: (state, action) => {
            const { email, role } = action.payload;
            const existing = state.currentWorkspace.members.find((m) => m.user.email === email);
            if (existing) return;

            let user = dummyUsers.find((u) => u.email === email);
            if (!user) {
                user = {
                    id: `user_${Date.now()}`,
                    name: email.split("@")[0],
                    email,
                    image: assets.profile_img_a,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
            }

            const member = {
                id: crypto.randomUUID(),
                userId: user.id,
                workspaceId: state.currentWorkspace.id,
                message: "",
                role: role === "org:admin" ? "ADMIN" : "MEMBER",
                user,
            };

            state.currentWorkspace.members.push(member);
            syncCurrentToWorkspaces(state);
        },
        addProjectMember: (state, action) => {
            const { projectId, userId } = action.payload;
            const wsMember = state.currentWorkspace.members.find((m) => m.userId === userId || m.user.id === userId);
            if (!wsMember) return;

            state.currentWorkspace.projects = state.currentWorkspace.projects.map((p) => {
                if (p.id !== projectId) return p;
                if (p.members?.some((m) => m.userId === wsMember.userId)) return p;
                return {
                    ...p,
                    members: [
                        ...(p.members || []),
                        {
                            id: crypto.randomUUID(),
                            userId: wsMember.userId,
                            projectId,
                            user: wsMember.user,
                        },
                    ],
                };
            });
            syncCurrentToWorkspaces(state);
        },
        addComment: (state, action) => {
            const { projectId, taskId, comment } = action.payload;
            state.currentWorkspace.projects = state.currentWorkspace.projects.map((p) => {
                if (p.id !== projectId) return p;
                return {
                    ...p,
                    tasks: p.tasks.map((t) =>
                        t.id === taskId
                            ? { ...t, comments: [...(t.comments || []), comment], updatedAt: new Date().toISOString() }
                            : t
                    ),
                };
            });
            syncCurrentToWorkspaces(state);
        },
    },
});

export const {
    setWorkspaces,
    setCurrentWorkspace,
    addWorkspace,
    updateWorkspace,
    deleteWorkspace,
    addProject,
    updateProject,
    addTask,
    updateTask,
    deleteTask,
    inviteMember,
    addProjectMember,
    addComment,
} = workspaceSlice.actions;

export default workspaceSlice.reducer;
