import { PanelLeft, MoonIcon, SunIcon } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleTheme } from '../features/themeSlice'
import { assets } from '../assets/assets'
import GlobalSearch from './GlobalSearch'
import { CURRENT_USER } from '../lib/currentUser'

const Navbar = ({ setIsSidebarOpen }) => {

    const dispatch = useDispatch();
    const { theme } = useSelector(state => state.theme);

    return (
        <header className="ops-navbar w-full px-4 md:px-8 flex-shrink-0">
            <div className="flex items-center justify-between h-full max-w-[1400px] mx-auto gap-4">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                    <button
                        type="button"
                        onClick={() => setIsSidebarOpen((prev) => !prev)}
                        className="md:hidden p-2 rounded-lg transition-colors hover:bg-white/5"
                        style={{ color: 'var(--color-text-secondary)' }}
                        aria-label="Toggle sidebar"
                    >
                        <PanelLeft size={20} />
                    </button>

                    <GlobalSearch />
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                        type="button"
                        onClick={() => dispatch(toggleTheme())}
                        className="size-9 flex items-center justify-center rounded-lg border transition-all hover:-translate-y-px"
                        style={{
                            background: 'var(--color-bg-tertiary)',
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text-secondary)',
                        }}
                        aria-label="Toggle theme"
                    >
                        {theme === "light"
                            ? <MoonIcon className="size-4" />
                            : <SunIcon className="size-4" style={{ color: 'var(--color-status-warning)' }} />
                        }
                    </button>

                    <div className="ops-avatar-ring">
                        <img src={CURRENT_USER.image || assets.profile_img_a} alt={CURRENT_USER.name} className="size-8 rounded-full" title={CURRENT_USER.name} />
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Navbar
