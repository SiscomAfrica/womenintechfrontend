import { ChevronRight, Home } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

interface BreadcrumbItem {
  label: string
  href?: string
}

export function Breadcrumb() {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter((x) => x)

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/dashboard' },
  ]

  
  pathnames.forEach((pathname, index) => {
    const href = `/${pathnames.slice(0, index + 1).join('/')}`
    const label = pathname.charAt(0).toUpperCase() + pathname.slice(1)
    
    breadcrumbItems.push({
      label,
      href: index === pathnames.length - 1 ? undefined : href, 
    })
  })

  if (breadcrumbItems.length <= 1) {
    return null 
  }

  return (
    <nav className="flex items-center space-x-1 md:space-x-2 text-sm text-[#666666] mb-4 overflow-x-auto">
      <div className="flex items-center space-x-1 md:space-x-2 whitespace-nowrap">
        {breadcrumbItems.map((item, index) => (
          <div key={index} className="flex items-center">
            {index > 0 && <ChevronRight className="h-4 w-4 mx-1 md:mx-2 flex-shrink-0" />}
            {index === 0 && <Home className="h-4 w-4 mr-1 flex-shrink-0" />}
            {item.href ? (
              <Link 
                to={item.href} 
                className="hover:text-[#FF6B35] transition-colors duration-200 truncate"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-[#1A1A1A] font-medium truncate">{item.label}</span>
            )}
          </div>
        ))}
      </div>
    </nav>
  )
}