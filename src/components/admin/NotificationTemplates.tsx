import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { FileText, Plus, Edit, Trash2, Copy } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import adminService, { type NotificationTemplate, type AnnouncementCreate } from '@/services/admin'

interface NotificationTemplatesProps {
  onSelectTemplate: (template: NotificationTemplate) => void
}

const NotificationTemplates: React.FC<NotificationTemplatesProps> = ({ onSelectTemplate }) => {
  const [isCreating, setIsCreating] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    message: '',
    type: 'info' as 'info' | 'warning' | 'urgent',
    variables: [] as string[]
  })

  const queryClient = useQueryClient()

  // Fetch templates
  const { data: templates, isLoading } = useQuery<NotificationTemplate[]>({
    queryKey: ['admin', 'notification-templates'],
    queryFn: () => adminService.getNotificationTemplates(),
  })

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: (data: Omit<NotificationTemplate, 'id'>) => adminService.createNotificationTemplate(data),
    onSuccess: () => {
      toast.success('Template created successfully!')
      setIsCreating(false)
      setFormData({ name: '', title: '', message: '', type: 'info', variables: [] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'notification-templates'] })
    },
    onError: (error: any) => {
      toast.error(`Failed to create template: ${error.message}`)
    },
  })

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.title.trim() || !formData.message.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    createTemplateMutation.mutate(formData)
  }

  const handleUseTemplate = (template: NotificationTemplate) => {
    // Replace variables in template with placeholders
    let title = template.title
    let message = template.message
    
    template.variables.forEach(variable => {
      const placeholder = `[${variable}]`
      title = title.replace(`{${variable}}`, placeholder)
      message = message.replace(`{${variable}}`, placeholder)
    })

    const announcement: AnnouncementCreate = {
      title,
      message,
      type: template.type,
      target_audience: 'all'
    }

    onSelectTemplate(template)
    toast.success(`Template "${template.name}" applied`)
  }

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addVariable = () => {
    const variable = prompt('Enter variable name (e.g., "event_name"):')
    if (variable && !formData.variables.includes(variable)) {
      setFormData(prev => ({
        ...prev,
        variables: [...prev.variables, variable]
      }))
    }
  }

  const removeVariable = (variable: string) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter(v => v !== variable)
    }))
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FileText className="w-5 h-5 text-purple-600 mr-2" />
          <h3 className="text-lg font-semibold">Notification Templates</h3>
        </div>
        <Button
          size="sm"
          onClick={() => setIsCreating(true)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Create Template Form */}
      {isCreating && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h4 className="font-medium mb-3">Create New Template</h4>
          <form onSubmit={handleCreateTemplate} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Welcome Message"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleInputChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Information</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title Template
              </label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Use {variable_name} for dynamic content"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message Template
              </label>
              <Textarea
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Use {variable_name} for dynamic content"
                rows={3}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Variables
                </label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addVariable}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Variable
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.variables.map((variable) => (
                  <Badge
                    key={variable}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeVariable(variable)}
                  >
                    {variable}
                    <Trash2 className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreating(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createTemplateMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {createTemplateMutation.isPending ? 'Creating...' : 'Create Template'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Templates List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : templates && templates.length > 0 ? (
        <div className="space-y-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="flex items-start justify-between p-3 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900">{template.name}</h4>
                  <Badge variant="outline" className="text-xs">
                    {template.type}
                  </Badge>
                  {template.variables.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {template.variables.length} variables
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-1">{template.title}</p>
                <p className="text-xs text-gray-500 line-clamp-2">{template.message}</p>
                {template.variables.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {template.variables.map((variable) => (
                      <Badge key={variable} variant="outline" className="text-xs">
                        {variable}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUseTemplate(template)}
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Use
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-8">No templates created yet</p>
      )}
    </Card>
  )
}

export default NotificationTemplates