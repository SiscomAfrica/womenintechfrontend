import * as React from 'react'



interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info'
  rule: string
  message: string
  element?: HTMLElement
  severity: 'critical' | 'serious' | 'moderate' | 'minor'
}

interface AccessibilityReport {
  issues: AccessibilityIssue[]
  score: number
  summary: {
    errors: number
    warnings: number
    info: number
  }
}

export class AccessibilityTester {
  private issues: AccessibilityIssue[] = []

  
  private testImageAltText(): void {
    const images = document.querySelectorAll('img')
    images.forEach((img) => {
      if (!img.alt && !img.getAttribute('aria-label') && !img.getAttribute('aria-labelledby')) {
        this.addIssue({
          type: 'error',
          rule: 'img-alt',
          message: 'Image missing alt text',
          element: img,
          severity: 'serious',
        })
      }
    })
  }

  
  private testHeadingHierarchy(): void {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    let previousLevel = 0

    headings.forEach((heading) => {
      const currentLevel = parseInt(heading.tagName.charAt(1))
      
      if (currentLevel > previousLevel + 1) {
        this.addIssue({
          type: 'error',
          rule: 'heading-order',
          message: `Heading level ${currentLevel} skips level ${previousLevel + 1}`,
          element: heading as HTMLElement,
          severity: 'moderate',
        })
      }
      
      previousLevel = currentLevel
    })

    
    const h1Elements = document.querySelectorAll('h1')
    if (h1Elements.length === 0) {
      this.addIssue({
        type: 'error',
        rule: 'page-has-heading-one',
        message: 'Page must have one h1 element',
        severity: 'serious',
      })
    } else if (h1Elements.length > 1) {
      this.addIssue({
        type: 'warning',
        rule: 'page-has-heading-one',
        message: 'Page should have only one h1 element',
        severity: 'moderate',
      })
    }
  }

  
  private testFormLabels(): void {
    const inputs = document.querySelectorAll('input, select, textarea')
    
    inputs.forEach((input) => {
      const hasLabel = this.hasAccessibleLabel(input as HTMLElement)
      
      if (!hasLabel) {
        this.addIssue({
          type: 'error',
          rule: 'label',
          message: 'Form element missing accessible label',
          element: input as HTMLElement,
          severity: 'critical',
        })
      }
    })
  }

  
  private testKeyboardAccessibility(): void {
    const interactiveElements = document.querySelectorAll(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    interactiveElements.forEach((element) => {
      const tabIndex = element.getAttribute('tabindex')
      
      
      if (tabIndex && parseInt(tabIndex) > 0) {
        this.addIssue({
          type: 'warning',
          rule: 'tabindex',
          message: 'Avoid positive tabindex values',
          element: element as HTMLElement,
          severity: 'moderate',
        })
      }

      
      const computedStyle = window.getComputedStyle(element as HTMLElement, ':focus')
      const hasOutline = computedStyle.outline !== 'none' && computedStyle.outline !== '0px'
      const hasBoxShadow = computedStyle.boxShadow !== 'none'
      
      if (!hasOutline && !hasBoxShadow) {
        this.addIssue({
          type: 'warning',
          rule: 'focus-indicator',
          message: 'Interactive element may lack visible focus indicator',
          element: element as HTMLElement,
          severity: 'serious',
        })
      }
    })
  }

  
  private testColorContrast(): void {
    const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, button, label')
    
    textElements.forEach((element) => {
      const style = window.getComputedStyle(element as HTMLElement)
      const backgroundColor = style.backgroundColor
      const color = style.color
      
      
      if (!element.textContent?.trim() || backgroundColor === 'rgba(0, 0, 0, 0)') {
        return
      }

      const contrast = this.calculateContrast(color, backgroundColor)
      const fontSize = parseFloat(style.fontSize)
      const fontWeight = style.fontWeight
      
      
      const isLargeText = fontSize >= 18 || (fontSize >= 14 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700))
      const requiredRatio = isLargeText ? 3 : 4.5
      
      if (contrast < requiredRatio) {
        this.addIssue({
          type: 'error',
          rule: 'color-contrast',
          message: `Insufficient color contrast: ${contrast.toFixed(2)}:1 (required: ${requiredRatio}:1)`,
          element: element as HTMLElement,
          severity: 'serious',
        })
      }
    })
  }

  
  private testAriaUsage(): void {
    const elementsWithAria = document.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby], [role]')
    
    elementsWithAria.forEach((element) => {
      const role = element.getAttribute('role')
      const ariaLabel = element.getAttribute('aria-label')
      const ariaLabelledby = element.getAttribute('aria-labelledby')
      const ariaDescribedby = element.getAttribute('aria-describedby')
      
      
      if (ariaLabel === '') {
        this.addIssue({
          type: 'error',
          rule: 'aria-label',
          message: 'aria-label attribute is empty',
          element: element as HTMLElement,
          severity: 'serious',
        })
      }
      
      
      if (role && !this.isValidAriaRole(role)) {
        this.addIssue({
          type: 'error',
          rule: 'aria-role',
          message: `Invalid ARIA role: ${role}`,
          element: element as HTMLElement,
          severity: 'serious',
        })
      }
      
      
      if (ariaLabelledby) {
        const referencedElements = ariaLabelledby.split(' ')
        referencedElements.forEach((id) => {
          if (!document.getElementById(id)) {
            this.addIssue({
              type: 'error',
              rule: 'aria-labelledby',
              message: `aria-labelledby references non-existent element: ${id}`,
              element: element as HTMLElement,
              severity: 'serious',
            })
          }
        })
      }
      
      if (ariaDescribedby) {
        const referencedElements = ariaDescribedby.split(' ')
        referencedElements.forEach((id) => {
          if (!document.getElementById(id)) {
            this.addIssue({
              type: 'error',
              rule: 'aria-describedby',
              message: `aria-describedby references non-existent element: ${id}`,
              element: element as HTMLElement,
              severity: 'serious',
            })
          }
        })
      }
    })
  }

  
  private hasAccessibleLabel(element: HTMLElement): boolean {
    
    if (element.getAttribute('aria-label')) return true
    
    
    if (element.getAttribute('aria-labelledby')) return true
    
    
    const id = element.id
    if (id && document.querySelector(`label[for="${id}"]`)) return true
    
    
    const parentLabel = element.closest('label')
    if (parentLabel) return true
    
    
    if (element.getAttribute('title')) return true
    
    return false
  }

  private calculateContrast(foreground: string, background: string): number {
    const getLuminance = (color: string): number => {
      
      const rgb = this.parseColor(color)
      if (!rgb) return 0
      
      
      const [r, g, b] = rgb.map(c => {
        c = c / 255
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      })
      
      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }

    const l1 = getLuminance(foreground)
    const l2 = getLuminance(background)
    
    const lighter = Math.max(l1, l2)
    const darker = Math.min(l1, l2)
    
    return (lighter + 0.05) / (darker + 0.05)
  }

  private parseColor(color: string): [number, number, number] | null {
    
    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (rgbMatch) {
      return [parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3])]
    }
    
    
    const rgbaMatch = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/)
    if (rgbaMatch) {
      return [parseInt(rgbaMatch[1]), parseInt(rgbaMatch[2]), parseInt(rgbaMatch[3])]
    }
    
    
    const hexMatch = color.match(/^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
    if (hexMatch) {
      return [
        parseInt(hexMatch[1], 16),
        parseInt(hexMatch[2], 16),
        parseInt(hexMatch[3], 16)
      ]
    }
    
    return null
  }

  private isValidAriaRole(role: string): boolean {
    const validRoles = [
      'alert', 'alertdialog', 'application', 'article', 'banner', 'button',
      'cell', 'checkbox', 'columnheader', 'combobox', 'complementary',
      'contentinfo', 'definition', 'dialog', 'directory', 'document',
      'feed', 'figure', 'form', 'grid', 'gridcell', 'group', 'heading',
      'img', 'link', 'list', 'listbox', 'listitem', 'log', 'main',
      'marquee', 'math', 'menu', 'menubar', 'menuitem', 'menuitemcheckbox',
      'menuitemradio', 'navigation', 'none', 'note', 'option', 'presentation',
      'progressbar', 'radio', 'radiogroup', 'region', 'row', 'rowgroup',
      'rowheader', 'scrollbar', 'search', 'searchbox', 'separator',
      'slider', 'spinbutton', 'status', 'switch', 'tab', 'table',
      'tablist', 'tabpanel', 'term', 'textbox', 'timer', 'toolbar',
      'tooltip', 'tree', 'treegrid', 'treeitem'
    ]
    
    return validRoles.includes(role)
  }

  private addIssue(issue: AccessibilityIssue): void {
    this.issues.push(issue)
  }

  
  public runTests(): AccessibilityReport {
    this.issues = []
    
    this.testImageAltText()
    this.testHeadingHierarchy()
    this.testFormLabels()
    this.testKeyboardAccessibility()
    this.testColorContrast()
    this.testAriaUsage()
    
    const summary = {
      errors: this.issues.filter(issue => issue.type === 'error').length,
      warnings: this.issues.filter(issue => issue.type === 'warning').length,
      info: this.issues.filter(issue => issue.type === 'info').length,
    }
    
    
    const score = Math.max(0, 100 - (summary.errors * 10 + summary.warnings * 5 + summary.info * 1))
    
    return {
      issues: this.issues,
      score,
      summary,
    }
  }

  public logReport(report: AccessibilityReport): void {
    console.group('🔍 Accessibility Report')
    console.log(`Score: ${report.score}/100`)
    console.log(`Issues: ${report.summary.errors} errors, ${report.summary.warnings} warnings, ${report.summary.info} info`)
    
    if (report.issues.length > 0) {
      console.group('Issues:')
      report.issues.forEach((issue) => {
        const icon = issue.type === 'error' ? '❌' : issue.type === 'warning' ? '⚠️' : 'ℹ️'
        console.log(`${icon} ${issue.rule}: ${issue.message}`, issue.element)
      })
      console.groupEnd()
    }
    
    console.groupEnd()
  }
}


export function runAccessibilityTests(): AccessibilityReport {
  const tester = new AccessibilityTester()
  const report = tester.runTests()
  
  if (process.env.NODE_ENV === 'development') {
    tester.logReport(report)
  }
  
  return report
}


export function useAccessibilityTesting(enabled: boolean = process.env.NODE_ENV === 'development') {
  const [report, setReport] = React.useState<AccessibilityReport | null>(null)
  
  React.useEffect(() => {
    if (!enabled) return
    
    const runTests = () => {
      const newReport = runAccessibilityTests()
      setReport(newReport)
    }
    
    
    const timeoutId = setTimeout(runTests, 1000)
    
    return () => clearTimeout(timeoutId)
  }, [enabled])
  
  return report
}