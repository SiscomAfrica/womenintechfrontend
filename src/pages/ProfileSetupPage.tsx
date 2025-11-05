import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FormField } from "@/components/ui/form-field"
import { useAuthStore } from "@/stores/auth-store"
import { useSetupProfile } from "@/hooks/useAuth"
import { BriefcaseIcon, BuildingIcon, PhoneIcon } from "lucide-react"
import { toast } from "sonner"

interface ProfileSetupFormData {
  fullName: string
  bio?: string
  jobTitle: string
  company?: string
  phone?: string
}

const availableInterests = [
  'Real Estate',
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Agriculture',
  'Entertainment',
  'Sports',
  'Fashion',
  'Networking',
  'Innovation',
  'Startups',
]

export default function ProfileSetupPage() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  
  const navigate = useNavigate()
  const location = useLocation()
  const { setUser, token, user } = useAuthStore()
  
  const setupProfileMutation = useSetupProfile()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileSetupFormData>()

  const from = location.state?.from?.pathname || '/dashboard'

  
  useEffect(() => {
    if (!token) {
      console.log('[ProfileSetupPage] No token found, redirecting to login')
      toast.error('Authentication required', {
        description: 'Please login first.',
      })
      navigate('/login', { replace: true })
    } else if (user?.profile_completed) {
      
      console.log('[ProfileSetupPage] Profile already complete, redirecting to', from)
      navigate(from, { replace: true })
    }
  }, [token, user, navigate, from])

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((item) => item !== interest)
        : [...prev, interest]
    )
  }

  const onSubmit = async (data: ProfileSetupFormData) => {
    try {
      const user = await setupProfileMutation.mutateAsync({
        profile: {
          name: data.fullName,
          job_title: data.jobTitle,
          company: data.company,
          location: data.phone, 
          bio: data.bio,
          interests: selectedInterests,
        }
      })
      
      console.log('[ProfileSetupPage] Profile setup complete, user:', user)
      
      const updatedUser = {
        ...user,
        profile_completed: true
      }
      setUser(updatedUser)
      
      toast.success('Welcome! Your profile is complete.')
      
      console.log('[ProfileSetupPage] Navigating to:', from)
      setTimeout(() => {
        navigate(from, { replace: true })
      }, 100)
    } catch (error: any) {
      console.error('Failed to setup profile:', error)
      toast.error('Failed to setup profile', {
        description: error.message || 'Please try again.',
      })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-bg-tertiary">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="w-20 h-20 mx-auto mb-4">
            <img 
              src="/assets/images/afriinovation512.png" 
              alt="Afriinovation Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <CardTitle className="text-heading-lg text-text-primary">
            Let us get to know you
          </CardTitle>
          <CardDescription className="text-body-md text-text-tertiary">
            Complete your profile to get started
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {}
            <FormField
              label="Full Name"
              error={errors.fullName?.message}
              required
            >
              <Input
                {...register('fullName', {
                  required: 'Full name is required',
                })}
                placeholder="Your full name"
                error={errors.fullName?.message}
              />
            </FormField>

            {}
            <FormField
              label="About"
              error={errors.bio?.message}
            >
              <Textarea
                {...register('bio')}
                placeholder="Short bio about you"
                rows={3}
                className="resize-none"
              />
            </FormField>

            {}
            <FormField
              label="Job Title"
              error={errors.jobTitle?.message}
              required
            >
              <Input
                {...register('jobTitle', {
                  required: 'Job title is required',
                })}
                placeholder="What do you do"
                error={errors.jobTitle?.message}
                icon={<BriefcaseIcon className="h-5 w-5" />}
              />
            </FormField>

            {}
            <FormField
              label="Company"
              error={errors.company?.message}
            >
              <Input
                {...register('company')}
                placeholder="Your company"
                icon={<BuildingIcon className="h-5 w-5" />}
              />
            </FormField>

            {}
            <FormField
              label="Phone"
              error={errors.phone?.message}
            >
              <Input
                {...register('phone')}
                placeholder="+1 234 567 8900"
                type="tel"
                icon={<PhoneIcon className="h-5 w-5" />}
              />
            </FormField>

            {}
            <div className="space-y-3">
              <label className="text-sm font-medium text-text-primary">
                Interests
              </label>
              <div className="flex flex-wrap gap-2">
                {availableInterests.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`
                      px-4 py-2 rounded-full text-sm font-medium transition-colors
                      ${
                        selectedInterests.includes(interest)
                          ? 'bg-gradient-to-br from-purple-900/85 via-indigo-900/80 to-pink-900/85 text-white'
                          : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
                      }
                    `}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            {setupProfileMutation.error && (
              <p className="text-sm text-red-500 text-center">
                {setupProfileMutation.error.message}
              </p>
            )}

            <Button 
              type="submit"
              disabled={setupProfileMutation.isPending}
              className="w-full"
              size="lg"
            >
              {setupProfileMutation.isPending ? 'Setting up...' : 'Complete Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
