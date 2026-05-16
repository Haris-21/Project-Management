import { useEffect, useState } from "react";
import { UsersIcon, Search, UserPlus, Activity, ListTodo } from "lucide-react";
import InviteMemberDialog from "../components/InviteMemberDialog";
import { useSelector } from "react-redux";

const Team = () => {

    const [tasks, setTasks] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const currentWorkspace = useSelector((state) => state?.workspace?.currentWorkspace || null);
    const projects = currentWorkspace?.projects || [];

    const filteredUsers = users.filter(
        (user) =>
            user?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user?.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        setUsers(currentWorkspace?.members || []);
        setTasks(currentWorkspace?.projects?.reduce((acc, project) => [...acc, ...project.tasks], []) || []);
    }, [currentWorkspace]);

    const statCards = [
        { label: "Total Members", value: users.length, icon: UsersIcon, iconBg: "rgba(99, 102, 241, 0.1)", iconColor: "var(--color-accent-primary)" },
        { label: "Active Projects", value: projects.filter((p) => p.status !== "CANCELLED" && p.status !== "COMPLETED").length, icon: Activity, iconBg: "rgba(16, 185, 129, 0.1)", iconColor: "var(--color-status-success)" },
        { label: "Total Tasks", value: tasks.length, icon: ListTodo, iconBg: "rgba(139, 92, 246, 0.1)", iconColor: "var(--color-accent-secondary)" },
    ];

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>Team</h1>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        Manage team members and their contributions
                    </p>
                </div>
                <button type="button" onClick={() => setIsDialogOpen(true)} className="ops-btn-primary flex items-center gap-2">
                    <UserPlus className="w-4 h-4" /> Invite Member
                </button>
                <InviteMemberDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {statCards.map((card) => (
                    <div key={card.label} className="ops-stat-card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="ops-stat-label">{card.label}</p>
                                <p className="ops-stat-value text-2xl">{card.value}</p>
                            </div>
                            <div className="ops-icon-box" style={{ background: card.iconBg }}>
                                <card.icon className="size-4" style={{ color: card.iconColor }} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 pointer-events-none" style={{ color: 'var(--color-text-tertiary)' }} />
                <input
                    placeholder="Search team members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="ops-input w-full pl-10 pr-4 py-2"
                />
            </div>

            {filteredUsers.length === 0 ? (
                <div className="ops-empty-state">
                    <div className="ops-empty-icon w-20 h-20">
                        <UsersIcon className="w-10 h-10" />
                    </div>
                    <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                        {users.length === 0 ? "No team members yet" : "No members match your search"}
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {users.length === 0 ? "Invite team members to start collaborating" : "Try adjusting your search term"}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredUsers.map((member) => (
                        <div key={member.id} className="ops-card ops-card-hover p-5">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="ops-avatar-lg">
                                    {member.user?.image ? (
                                        <img src={member.user.image} alt={member.user.name} />
                                    ) : (
                                        <span>{member.user?.name?.[0]?.toUpperCase() || "?"}</span>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                                        {member.user?.name || "Unknown User"}
                                    </p>
                                    <p className="text-sm truncate" style={{ color: 'var(--color-text-tertiary)' }}>
                                        {member.user.email}
                                    </p>
                                </div>
                            </div>
                            <span className={member.role === "ADMIN" ? "ops-role-admin" : "ops-role-member"}>
                                {member.role || "User"}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Team;
