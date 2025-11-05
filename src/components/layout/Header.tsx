import { User, LogOut, Settings, Building2 } from "lucide-react"
import { useAuthStore } from "@/stores/auth-store"
import { NavLink, Link } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import { NotificationCenter } from "@/components/NotificationCenter"

export function Header() {
  const { user, logout } = useAuthStore()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  
  
  // Debug: Log user object to see admin status
  console.log('🔍 User object:', user)
  console.log('🔍 Is admin check:', user?.is_admin === true)
  const isAdmin = user?.is_admin === true

  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscapeKey)
      // Prevent body scroll when menu is open on mobile
      document.body.style.overflow = 'hidden'
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleEscapeKey)
        document.body.style.overflow = 'unset'
      }
    }
  }, [showUserMenu])

  return (
    <header className="bg-white border-b border-[#E0E0E0] sticky top-0 z-[100] w-full overflow-visible">
      <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 h-14 md:h-16 max-w-full">
        {/* Left side - Logo */}
        <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
          {/* Logo - Clickable to go to dashboard */}
          <Link style={{width: "200px", height: "250px"}} to="/dashboard" className="flex items-center gap-2 !w-[150px]">
            <img 
              src="/assets/images/main.png" 
              alt="WomenInTech Logo" 
              className="w-[50%] h-8 md:w-full md:h-[50%] rounded-lg flex-shrink-0"
            />
          
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-6 flex-shrink-0">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `font-medium transition-colors ${
                isActive ? 'text-[#60166b]' : 'text-[#333333] hover:text-[#60166b]'
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/schedule"
            className={({ isActive }) =>
              `font-medium transition-colors ${
                isActive ? 'text-[#60166b]' : 'text-[#333333] hover:text-[#60166b]'
              }`
            }
          >
            Schedule
          </NavLink>
          <NavLink
            to="/networking"
            className={({ isActive }) =>
              `font-medium transition-colors ${
                isActive ? 'text-[#60166b]' : 'text-[#333333] hover:text-[#60166b]'
              }`
            }
          >
            Networking
          </NavLink>
          <NavLink
            to="/polls"
            className={({ isActive }) =>
              `font-medium transition-colors ${
                isActive ? 'text-[#60166b]' : 'text-[#333333] hover:text-[#60166b]'
              }`
            }
          >
            Polls
          </NavLink>
        </nav>

        {/* Right side - Notifications & User Menu */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Notification Center */}
          <NotificationCenter />
          
          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setShowUserMenu(!showUserMenu)
              }}
              className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              aria-expanded={showUserMenu}
              aria-haspopup="true"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-900/85 via-indigo-900/80 to-pink-900/85 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-xs sm:text-sm">
                  {user?.profile?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </span>
              </div>
              <span className="hidden md:block text-[#333333] font-medium text-sm truncate max-w-[120px]">
                {user?.profile?.name || user?.email?.split('@')[0] || 'User'}
              </span>
            </button>
            
            {/* Backdrop for mobile */}
            {showUserMenu && (
              <div 
                className="fixed inset-0 bg-black/20 backdrop-blur-sm sm:hidden z-[9998]"
                onClick={() => setShowUserMenu(false)}
                aria-hidden="true"
              />
            )}
            
            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div 
                className="fixed sm:absolute top-14 sm:top-full right-3 sm:right-0 mt-1 sm:mt-2 w-[calc(100vw-1.5rem)] sm:w-64 md:w-72 bg-white rounded-xl shadow-2xl border border-[#E0E0E0] py-2 z-[9999] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                style={{ 
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15), 0 0 1px rgba(0, 0, 0, 0.1)',
                }}
                role="menu"
                aria-orientation="vertical"
                aria-label="User menu"
              >
                <div className="px-4 py-3 border-b border-[#E5E7EB] bg-gradient-to-br from-purple-50 to-white">
                  <p className="font-semibold text-[#1A1A1A] truncate text-sm md:text-base">
                    {user?.profile?.name || user?.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-[#666666] truncate mt-1">{user?.email}</p>
                </div>
                <div className="py-1">
                  <Link 
                    to="/profile"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowUserMenu(false)
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-[#F8F9FA] active:bg-[#F0F0F0] text-sm md:text-base text-[#333333] transition-all duration-150"
                    role="menuitem"
                  >
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-50">
                      <User className="h-4 w-4 md:h-5 md:w-5 text-[#60166b] flex-shrink-0" />
                    </div>
                    <span className="font-medium">Profile</span>
                  </Link>
                  {isAdmin && (
                    <Link 
                      to="/admin"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowUserMenu(false)
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-[#F8F9FA] active:bg-[#F0F0F0] text-sm md:text-base text-[#333333] transition-all duration-150"
                      role="menuitem"
                    >
                      <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#F0F4FF]">
                        <Settings className="h-4 w-4 md:h-5 md:w-5 text-[#007AFF] flex-shrink-0" />
                      </div>
                      <span className="font-medium">Admin Panel</span>
                    </Link>
                  )}
                  <Link 
                    to="/partners"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowUserMenu(false)
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-[#F8F9FA] active:bg-[#F0F0F0] text-sm md:text-base text-[#333333] transition-all duration-150"
                    role="menuitem"
                  >
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#F0FDF4]">
                      <Building2 className="h-4 w-4 md:h-5 md:w-5 text-[#4CAF50] flex-shrink-0" />
                    </div>
                    <span className="font-medium">Partners</span>
                  </Link>
                </div>
                <div className="border-t border-[#E5E7EB] my-1"></div>
                <div className="py-1">
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      logout()
                      setShowUserMenu(false)
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-red-50 active:bg-red-100 text-sm md:text-base font-medium text-red-600 transition-all duration-150"
                    role="menuitem"
                  >
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50">
                      <LogOut className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                    </div>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}