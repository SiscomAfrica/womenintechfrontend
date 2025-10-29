import * as React from "react"
import { cn } from "@/lib/utils"
import { useAccessibility } from "@/hooks/useAccessibility"


interface NavigationProps {
  children: React.ReactNode
  className?: string
  ariaLabel?: string
  orientation?: 'horizontal' | 'vertical'
}

export function Navigation({ 
  children, 
  className, 
  ariaLabel = "Main navigation",
  orientation = 'horizontal'
}: NavigationProps) {
  const navRef = React.useRef<HTMLElement>(null)
  const { handleArrowNavigation } = useAccessibility()
  const [currentIndex, setCurrentIndex] = React.useState(0)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!navRef.current) return

    const links = Array.from(
      navRef.current.querySelectorAll('[role="menuitem"], a, button')
    ) as HTMLElement[]

    if (links.length === 0) return

    const newIndex = handleArrowNavigation(e.nativeEvent, links, currentIndex, {
      horizontal: orientation === 'horizontal',
      vertical: orientation === 'vertical',
      wrap: true,
    })

    setCurrentIndex(newIndex)
  }

  return (
    <nav
      ref={navRef}
      className={cn("flex", className)}
      aria-label={ariaLabel}
      role="navigation"
      onKeyDown={handleKeyDown}
    >
      <ul 
        className={cn(
          "flex",
          orientation === 'vertical' ? "flex-col" : "flex-row"
        )}
        role="menubar"
        aria-orientation={orientation}
      >
        {children}
      </ul>
    </nav>
  )
}


interface NavigationItemProps {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  active?: boolean
  disabled?: boolean
  className?: string
  ariaLabel?: string
}

export function NavigationItem({
  children,
  href,
  onClick,
  active = false,
  disabled = false,
  className,
  ariaLabel,
}: NavigationItemProps) {
  const Component = href ? 'a' : 'button'
  
  return (
    <li role="none">
      <Component
        href={href}
        onClick={onClick}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          active && "bg-accent text-accent-foreground",
          className
        )}
        role="menuitem"
        aria-current={active ? "page" : undefined}
        aria-disabled={disabled}
        aria-label={ariaLabel}
        tabIndex={disabled ? -1 : 0}
      >
        {children}
      </Component>
    </li>
  )
}


interface BreadcrumbProps {
  items: Array<{
    label: string
    href?: string
    current?: boolean
  }>
  className?: string
  separator?: React.ReactNode
}

export function Breadcrumb({ 
  items, 
  className,
  separator = "/"
}: BreadcrumbProps) {
  return (
    <nav 
      aria-label="Breadcrumb"
      className={cn("flex", className)}
    >
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <span 
                className="mx-2 text-muted-foreground" 
                aria-hidden="true"
              >
                {separator}
              </span>
            )}
            {item.current ? (
              <span 
                className="font-medium text-foreground"
                aria-current="page"
              >
                {item.label}
              </span>
            ) : (
              <a
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}


interface SkipLinksProps {
  links: Array<{
    href: string
    label: string
  }>
}

export function SkipLinks({ links }: SkipLinksProps) {
  return (
    <div className="sr-only focus-within:not-sr-only">
      {links.map((link, index) => (
        <a
          key={index}
          href={link.href}
          className="absolute top-4 left-4 z-50 px-4 py-2 bg-primary text-primary-foreground rounded focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          onClick={(e) => {
            e.preventDefault()
            const target = document.querySelector(link.href)
            if (target) {
              (target as HTMLElement).focus()
              target.scrollIntoView({ behavior: 'smooth' })
            }
          }}
        >
          {link.label}
        </a>
      ))}
    </div>
  )
}


interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
  showFirstLast?: boolean
  showPrevNext?: boolean
  maxVisiblePages?: number
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  showFirstLast = true,
  showPrevNext = true,
  maxVisiblePages = 5,
}: PaginationProps) {
  const getVisiblePages = () => {
    const pages: (number | string)[] = []
    const halfVisible = Math.floor(maxVisiblePages / 2)
    
    let start = Math.max(1, currentPage - halfVisible)
    let end = Math.min(totalPages, currentPage + halfVisible)
    
    
    if (end - start + 1 < maxVisiblePages) {
      if (start === 1) {
        end = Math.min(totalPages, start + maxVisiblePages - 1)
      } else {
        start = Math.max(1, end - maxVisiblePages + 1)
      }
    }
    
    
    if (start > 1) {
      pages.push(1)
      if (start > 2) {
        pages.push('...')
      }
    }
    
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push('...')
      }
      pages.push(totalPages)
    }
    
    return pages
  }

  const visiblePages = getVisiblePages()

  return (
    <nav 
      aria-label="Pagination"
      className={cn("flex items-center justify-center space-x-1", className)}
    >
      {showFirstLast && (
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Go to first page"
        >
          First
        </button>
      )}
      
      {showPrevNext && (
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Go to previous page"
        >
          Previous
        </button>
      )}
      
      {visiblePages.map((page, index) => (
        <React.Fragment key={index}>
          {typeof page === 'number' ? (
            <button
              onClick={() => onPageChange(page)}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                page === currentPage
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
              aria-label={`Go to page ${page}`}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </button>
          ) : (
            <span 
              className="px-3 py-2 text-sm text-muted-foreground"
              aria-hidden="true"
            >
              {page}
            </span>
          )}
        </React.Fragment>
      ))}
      
      {showPrevNext && (
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Go to next page"
        >
          Next
        </button>
      )}
      
      {showFirstLast && (
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Go to last page"
        >
          Last
        </button>
      )}
    </nav>
  )
}