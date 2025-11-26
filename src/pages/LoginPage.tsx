import React, { useState, useCallback } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormField } from "@/components/ui/form-field"
import { CodeInput } from "@/components/ui/code-input"
import { useAuthStore } from "@/stores/auth-store"
import { useSendMagicLink, useVerifyMagicLink } from "@/hooks/useAuth"
import { MailIcon, ArrowLeftIcon } from "lucide-react"
import { toast } from "sonner"

type LoginStep = 'email' | 'code'

interface EmailFormData {
  email: string
}

export default function LoginPage() {
  const [step, setStep] = useState<LoginStep>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState<string[]>(Array(6).fill(''))
  const [resendCooldown, setResendCooldown] = useState(0)
  
  const navigate = useNavigate()
  const location = useLocation()
  const { setUser, setToken, isAuthenticated } = useAuthStore()
  
  
  const sendMagicLinkMutation = useSendMagicLink()
  const verifyMagicLinkMutation = useVerifyMagicLink()

  const from = location.state?.from?.pathname || '/dashboard'

  
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, from])



  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailFormData>()

  
  React.useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleEmailSubmit = useCallback(async (data: EmailFormData) => {
    try {
      await sendMagicLinkMutation.mutateAsync(data.email)
      setEmail(data.email)
      setStep('code')
      setResendCooldown(60)
      toast.success('Verification code sent to your email')
    } catch (error: any) {
      console.error('Failed to send magic link:', error)
      
      
      const errorMessage = error.message || 'Failed to send verification code'
      const status = error.status
      
      if (status === 400 || status === 404 || errorMessage.includes('No account found') || errorMessage.includes('not found')) {
        toast.error('Email not registered', {
          description: 'Please sign up first.',
          duration: 5000,
          action: {
            label: 'Sign Up',
            onClick: () => navigate('/register'),
          },
        })
      } else if (status === 401) {
        toast.error('Unauthorized access')
      } else {
        toast.error('Failed to send code', {
          description: errorMessage,
        })
      }
    }
  }, [sendMagicLinkMutation, navigate])

  const handleCodeComplete = useCallback(async (verificationCode: string) => {
    try {
      const response = await verifyMagicLinkMutation.mutateAsync({
        email,
        code: verificationCode,
      })
      
      console.log('[LoginPage] Login successful, setting token...')
      
      // Set token first
      setToken(response.access_token)
      
      // Fetch fresh user data from API (tenant-specific)
      const authService = (await import('@/services/auth')).default
      const userResponse = await authService.getCurrentUser()
      
      if (userResponse.success && userResponse.data) {
        console.log('[LoginPage] Fetched fresh user data:', userResponse.data)
        setUser(userResponse.data)
        
        toast.success('Login successful!')
        
        // Check profile completion from fresh data
        if (userResponse.data.profile_completed) {
          navigate(from, { replace: true })
        } else {
          toast.info('Please complete your profile')
          navigate('/profile-setup', { replace: true })
        }
      } else {
        throw new Error('Failed to fetch user data')
      }
    } catch (error: any) {
      console.error('Failed to verify code:', error)
      setCode(Array(6).fill(''))
      
      const errorMessage = error.message || 'Invalid verification code'
      const status = error.status
      
      if (status === 400 || errorMessage.includes('Invalid') || errorMessage.includes('incorrect')) {
        toast.error('Invalid verification code', {
          description: 'Please check the code and try again.',
        })
      } else if (status === 401) {
        toast.error('Code expired or invalid', {
          description: 'Please request a new verification code.',
        })
      } else {
        toast.error('Verification failed', {
          description: errorMessage,
        })
      }
    }
  }, [verifyMagicLinkMutation, email, setUser, setToken, navigate, from])

  const handleResendCode = useCallback(async () => {
    if (resendCooldown > 0) return
    
    try {
      await sendMagicLinkMutation.mutateAsync(email)
      setResendCooldown(60)
      toast.success('Code resent to your email')
    } catch (error: any) {
      console.error('Failed to resend code:', error)
      toast.error('Failed to resend code', {
        description: error.message || 'Please try again.',
      })
    }
  }, [resendCooldown, sendMagicLinkMutation, email])

  const handleBackToEmail = useCallback(() => {
    setStep('email')
    setCode(Array(6).fill(''))
    sendMagicLinkMutation.reset()
    verifyMagicLinkMutation.reset()
  }, [sendMagicLinkMutation, verifyMagicLinkMutation])

  if (step === 'code') {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-bg-tertiary">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-900/85 via-indigo-900/80 to-pink-900/85 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MailIcon className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-heading-lg text-text-primary">Check Your Email</CardTitle>
            <CardDescription className="text-body-md text-text-tertiary">
              We sent a 6-digit code to {email}
            </CardDescription>
            {import.meta.env.DEV && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-app-md p-3 mt-4">
                <p className="text-sm text-yellow-800 font-medium">
                  💡 Development Mode: Check the backend terminal for the verification code
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Look for: "For testing: Code for {email} is XXXXXX"
                </p>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <CodeInput
                value={code}
                onChange={setCode}
                onComplete={handleCodeComplete}
                disabled={verifyMagicLinkMutation.isPending}
              />
              {verifyMagicLinkMutation.error && (
                <p className="text-sm text-red-500 text-center mt-3">
                  {verifyMagicLinkMutation.error.message}
                </p>
              )}
            </div>

            <div className="text-center space-y-4">
              <div className="text-body-md text-text-tertiary">
                Didn't receive the code?{' '}
                <button
                  onClick={handleResendCode}
                  disabled={resendCooldown > 0 || sendMagicLinkMutation.isPending}
                  className="text-[#60166b] font-semibold hover:underline hover:text-[#60166b]/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {resendCooldown > 0 
                    ? `Resend in ${resendCooldown}s` 
                    : sendMagicLinkMutation.isPending 
                    ? 'Sending...' 
                    : 'Resend'
                  }
                </button>
              </div>
              
              <Button
                variant="ghost"
                onClick={handleBackToEmail}
                className="text-text-tertiary hover:text-text-primary"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-bg-tertiary">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-20 h-20 mx-auto mb-4">
            <img 
              src="/assets/images/main.png" 
              alt="Afriinovation Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <CardTitle className="text-heading-lg text-text-primary">Welcome Back</CardTitle>
          <CardDescription className="text-body-md text-text-tertiary">
            Sign in to access Women in Tech Summit 2025
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleEmailSubmit)} className="space-y-6">
            <FormField
              label="Email Address"
              error={errors.email?.message}
              required
            >
              <Input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Please enter a valid email address',
                  },
                })}
                type="email"
                placeholder="Enter your email"
                error={errors.email?.message}
                icon={<MailIcon className="h-5 w-5" />}
              />
            </FormField>

            {sendMagicLinkMutation.error && (
              <p className="text-sm text-red-500 text-center">
                {sendMagicLinkMutation.error.message}
              </p>
            )}

            <Button 
              type="submit"
              disabled={sendMagicLinkMutation.isPending}
              className="w-full"
              size="lg"
            >
              {sendMagicLinkMutation.isPending ? 'Sending Code...' : 'Continue with Email'}
            </Button>
          </form>
          
          <div className="text-center mt-6">
            <Link to="/register">
              <Button variant="ghost">
                Don't have an account? Sign up
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}