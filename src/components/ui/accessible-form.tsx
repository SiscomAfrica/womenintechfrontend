import * as React from "react"
import { cn } from "@/lib/utils"


interface FormContextValue {
  errors: Record<string, string>
  touched: Record<string, boolean>
  setFieldError: (name: string, error: string) => void
  setFieldTouched: (name: string, touched: boolean) => void
  announceError: (message: string) => void
}

const FormContext = React.createContext<FormContextValue | null>(null)

export function useFormContext() {
  const context = React.useContext(FormContext)
  if (!context) {
    throw new Error("useFormContext must be used within a FormProvider")
  }
  return context
}


interface FormProviderProps {
  children: React.ReactNode
  onSubmit?: (e: React.FormEvent) => void
  className?: string
  noValidate?: boolean
}

export function FormProvider({ 
  children, 
  onSubmit, 
  className,
  noValidate = true 
}: FormProviderProps) {
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [touched, setTouched] = React.useState<Record<string, boolean>>({})
  const announcementRef = React.useRef<HTMLDivElement>(null)

  const setFieldError = (name: string, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  const setFieldTouched = (name: string, touched: boolean) => {
    setTouched(prev => ({ ...prev, [name]: touched }))
  }

  const announceError = (message: string) => {
    if (announcementRef.current) {
      announcementRef.current.textContent = message
    }
  }

  const contextValue: FormContextValue = {
    errors,
    touched,
    setFieldError,
    setFieldTouched,
    announceError,
  }

  return (
    <FormContext.Provider value={contextValue}>
      <form 
        onSubmit={onSubmit}
        className={cn("space-y-4", className)}
        noValidate={noValidate}
      >
        {children}
        <div
          ref={announcementRef}
          aria-live="assertive"
          aria-atomic="true"
          className="sr-only"
        />
      </form>
    </FormContext.Provider>
  )
}


interface FormFieldProps {
  name: string
  label: string
  children: React.ReactNode
  description?: string
  required?: boolean
  className?: string
}

export function FormField({ 
  name, 
  label, 
  children, 
  description, 
  required = false,
  className 
}: FormFieldProps) {
  const { errors, touched } = useFormContext()
  const fieldId = React.useId()
  const errorId = `${fieldId}-error`
  const descriptionId = description ? `${fieldId}-description` : undefined
  
  const hasError = touched[name] && errors[name]

  return (
    <div className={cn("space-y-2", className)}>
      <label 
        htmlFor={fieldId}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>
      
      {description && (
        <p 
          id={descriptionId}
          className="text-sm text-muted-foreground"
        >
          {description}
        </p>
      )}
      
      <div className="relative">
        {React.cloneElement(children as React.ReactElement, {
          id: fieldId,
          name,
          required,
          'aria-invalid': hasError ? 'true' : 'false',
          'aria-describedby': cn(
            descriptionId,
            hasError ? errorId : undefined
          ),
        } as any)}
      </div>
      
      {hasError && (
        <p 
          id={errorId}
          className="text-sm text-red-500"
          role="alert"
          aria-live="polite"
        >
          {errors[name]}
        </p>
      )}
    </div>
  )
}


interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const AccessibleInput = React.forwardRef<HTMLInputElement, AccessibleInputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500 focus-visible:ring-red-500",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
AccessibleInput.displayName = "AccessibleInput"


interface AccessibleTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export const AccessibleTextarea = React.forwardRef<HTMLTextAreaElement, AccessibleTextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500 focus-visible:ring-red-500",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
AccessibleTextarea.displayName = "AccessibleTextarea"


interface AccessibleSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
  placeholder?: string
  options: Array<{ value: string; label: string; disabled?: boolean }>
}

export const AccessibleSelect = React.forwardRef<HTMLSelectElement, AccessibleSelectProps>(
  ({ className, error, placeholder, options, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500 focus-visible:ring-red-500",
          className
        )}
        ref={ref}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
    )
  }
)
AccessibleSelect.displayName = "AccessibleSelect"


interface AccessibleCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  description?: string
  error?: boolean
}

export const AccessibleCheckbox = React.forwardRef<HTMLInputElement, AccessibleCheckboxProps>(
  ({ className, label, description, error, id, ...props }, ref) => {
    const checkboxId = id || React.useId()
    const descriptionId = description ? `${checkboxId}-description` : undefined

    return (
      <div className="flex items-start space-x-2">
        <input
          type="checkbox"
          id={checkboxId}
          className={cn(
            "h-4 w-4 rounded border border-input bg-transparent text-primary shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500 focus-visible:ring-red-500",
            className
          )}
          aria-describedby={descriptionId}
          ref={ref}
          {...props}
        />
        <div className="grid gap-1.5 leading-none">
          <label
            htmlFor={checkboxId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
          {description && (
            <p 
              id={descriptionId}
              className="text-xs text-muted-foreground"
            >
              {description}
            </p>
          )}
        </div>
      </div>
    )
  }
)
AccessibleCheckbox.displayName = "AccessibleCheckbox"


export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: Record<keyof T, (value: any) => string | null>
) {
  const [values, setValues] = React.useState<T>(initialValues)
  const [errors, setErrors] = React.useState<Record<keyof T, string>>({} as Record<keyof T, string>)
  const [touched, setTouchedState] = React.useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>)

  const validateField = (name: keyof T, value: any) => {
    const rule = validationRules[name]
    if (rule) {
      const error = rule(value)
      setErrors(prev => ({ ...prev, [name]: error || '' }))
      return !error
    }
    return true
  }

  const validateAll = () => {
    const newErrors: Record<keyof T, string> = {} as Record<keyof T, string>
    let isValid = true

    Object.keys(validationRules).forEach(key => {
      const fieldName = key as keyof T
      const error = validationRules[fieldName](values[fieldName])
      if (error) {
        newErrors[fieldName] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const setValue = (name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }))
    validateField(name, value)
  }

  const setTouched = (name: keyof T, isTouched: boolean = true) => {
    setTouchedState(prev => ({ ...prev, [name]: isTouched }))
  }

  const reset = () => {
    setValues(initialValues)
    setErrors({} as Record<keyof T, string>)
    setTouchedState({} as Record<keyof T, boolean>)
  }

  return {
    values,
    errors,
    touched,
    setValue,
    setTouched,
    validateField,
    validateAll,
    reset,
    isValid: Object.values(errors).every(error => !error),
  }
}