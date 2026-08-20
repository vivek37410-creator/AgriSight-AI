import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'
import DemoBanner from '../components/DemoBanner'
import PageTransition from '../components/PageTransition'

export default function AppLayout() {
  return (
    <div className="flex h-screen bg-gradient-to-br from-nature-50/80 via-nature-100/60 to-leaf-50/80 dark:from-nature-950/80 dark:via-nature-900/60 dark:to-leaf-950/80">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <DemoBanner />
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </div>
  )
}
