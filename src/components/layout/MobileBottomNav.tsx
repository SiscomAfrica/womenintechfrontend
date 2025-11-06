import { NavLink } from 'react-router-dom'
import { BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"


const HomeIcon = ({ className }: { className?: string }) => (
  <img src="/assets/icons/home-svgrepo-com.svg" alt="Home" className={cn("h-6 w-6", className)} />
)

const ScheduleIcon = ({ className }: { className?: string }) => (
  <img src="/assets/icons/schedule-svgrepo-com.svg" alt="Schedule" className={cn("h-6 w-6", className)} />
)

const NetworkingIcon = ({ className }: { className?: string }) => (
  <img src="/assets/icons/networks.svg" alt="Networking" className={cn("h-6 w-6", className)} />
)

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Schedule', href: '/schedule', icon: ScheduleIcon },
  { name: 'Networking', href: '/networking', icon: NetworkingIcon },
  { name: 'Polls', href: '/polls', icon: BarChart3 },
]

export function MobileBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full bg-white border-t border-[#E0E0E0] md:hidden z-50 safe-area-pb">
      <div className="flex w-full max-w-full">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex-1 flex flex-col items-center justify-center py-2 px-1 min-h-[56px] relative transition-colors duration-200",
                isActive
                  ? "text-[#60166b]"
                  : "text-[#666666] active:bg-[#F5F5F5]"
              )
            }
          >
            {({ isActive }) => (
              <>
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-[#60166b] rounded-b-full" />
                )}
                <item.icon 
                  className={cn(
                    "h-5 w-5 mb-0.5 transition-colors duration-200 flex-shrink-0", 
                    isActive ? "text-[#60166b]" : "text-[#666666]"
                  )} 
                />
                <span 
                  className={cn(
                    "text-[10px] font-medium transition-colors duration-200 truncate max-w-full", 
                    isActive ? "text-[#60166b]" : "text-[#666666]"
                  )}
                >
                  {item.name}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}