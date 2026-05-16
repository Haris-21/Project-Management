import { Plus } from 'lucide-react'
import { useState } from 'react'
import { CURRENT_USER } from '../lib/currentUser'
import StatsGrid from '../components/StatsGrid'
import ProjectOverview from '../components/ProjectOverview'
import RecentActivity from '../components/RecentActivity'
import TasksSummary from '../components/TasksSummary'
import CreateProjectDialog from '../components/CreateProjectDialog'

const Dashboard = () => {

    const user = { fullName: CURRENT_USER.name }
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    return (
        <div className="max-w-[1400px] mx-auto">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-2">
                <div>
                    <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                        Welcome back, {user?.fullName || 'User'}
                    </h1>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        Here's what's happening with your projects today
                    </p>
                </div>

                <button type="button" onClick={() => setIsDialogOpen(true)} className="ops-btn-primary flex items-center gap-2">
                    <Plus size={16} /> New Project
                </button>

                <CreateProjectDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
            </div>

            <StatsGrid />

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <ProjectOverview />
                    <RecentActivity />
                </div>
                <div>
                    <TasksSummary />
                </div>
            </div>
        </div>
    )
}

export default Dashboard
