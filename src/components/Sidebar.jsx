import { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import MyTasksSidebar from './MyTasksSidebar'
import ProjectSidebar from './ProjectsSidebar'
import WorkspaceDropdown from './WorkspaceDropdown'
import { FolderOpenIcon, LayoutDashboardIcon, SettingsIcon, UsersIcon, Cloud } from 'lucide-react'

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {

    const menuItems = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboardIcon },
        { name: 'Projects', href: '/projects', icon: FolderOpenIcon },
        { name: 'Team', href: '/team', icon: UsersIcon },
    ]

    const sidebarRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setIsSidebarOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [setIsSidebarOpen]);

    return (
        <aside
            ref={sidebarRef}
            className={`ops-sidebar z-30 flex flex-col h-screen max-md:fixed max-md:inset-y-0 max-md:left-0 transition-transform duration-200 ${isSidebarOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full'}`}
        >
            <div className="ops-logo-area">
                <div className="ops-logo-icon">
                    <Cloud className="size-4 text-white" strokeWidth={2.5} />
                </div>
                <span className="ops-logo-wordmark">Cloud Ops Hub</span>
            </div>

            <WorkspaceDropdown />

            <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col py-2">
                <nav className="px-3 space-y-0.5">
                    <p className="ops-section-label px-3 py-2">Menu</p>
                    {menuItems.map((item) => (
                        <NavLink
                            to={item.href}
                            key={item.name}
                            end={item.href === '/'}
                            className={({ isActive }) =>
                                `ops-nav-item ${isActive ? 'ops-nav-item-active' : ''}`
                            }
                        >
                            <item.icon size={16} strokeWidth={2} />
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                    <button type="button" className="ops-nav-item w-full">
                        <SettingsIcon size={16} strokeWidth={2} />
                        <span>Settings</span>
                    </button>
                </nav>

                <MyTasksSidebar />
                <ProjectSidebar />
            </div>
        </aside>
    )
}

export default Sidebar

