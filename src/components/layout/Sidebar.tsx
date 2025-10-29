import { NavLink } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { BarChart3, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}


const HomeIcon = ({ className }: { className?: string }) => (
  <img src="/assets/icons/home-svgrepo-com.svg" alt="Home" className={cn("h-5 w-5", className)} />
)

const ScheduleIcon = ({ className }: { className?: string }) => (
  <img src="/assets/icons/schedule-svgrepo-com.svg" alt="Schedule" className={cn("h-5 w-5", className)} />
)

const NetworkingIcon = ({ className }: { className?: string }) => (
  <img src="/assets/icons/networks.svg" alt="Networking" className={cn("h-5 w-5", className)} />
)

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Schedule', href: '/schedule', icon: ScheduleIcon },
  { name: 'Networking', href: '/networking', icon: NetworkingIcon },
  { name: 'Polls', href: '/polls', icon: BarChart3 },
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {}
      <aside className={cn(
        "fixed left-0 top-16 md:top-18 h-[calc(100vh-4rem)] md:h-[calc(100vh-4.5rem)] w-64 bg-white border-r border-[#E0E0E0] transform transition-all duration-300 ease-in-out z-50 shadow-lg md:shadow-none",
        "md:relative md:top-0 md:h-[calc(100vh-4.5rem)] md:translate-x-0 md:block",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {}
          <div className="flex justify-end p-4 md:hidden">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {}
          <nav className="flex-1 px-4 pb-4">
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-[#FF6B35] text-white"
                          : "text-[#666666] hover:bg-[#F5F5F5] hover:text-[#333333]"
                      )
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  )
}