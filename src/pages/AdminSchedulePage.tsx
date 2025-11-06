import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  FileText, 
  Calendar, 
  Clock, 
  MapPin, 
  Users,
  CheckCircle,
  AlertCircle,
  Info,
  Download
} from 'lucide-react'
import { toast } from 'sonner'

interface ScheduleUploadResult {
  success: boolean
  message: string
  sessions_created: number
  sessions_updated: number
  errors: string[]
}

const AdminSchedulePage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResult, setUploadResult] = useState<ScheduleUploadResult | null>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      setFile(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const simulateUpload = async () => {
    setUploading(true)
    setUploadProgress(0)
    setUploadResult(null)

    
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i)
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    
    const mockResult: ScheduleUploadResult = {
      success: true,
      message: 'Schedule uploaded successfully',
      sessions_created: 45,
      sessions_updated: 12,
      errors: []
    }

    setUploadResult(mockResult)
    setUploading(false)
    toast.success('Schedule uploaded successfully!')
  }

  const handleUpload = async () => {
    if (!file) return

    try {
      await simulateUpload()
    } catch (error: any) {
      setUploading(false)
      setUploadResult({
        success: false,
        message: error.message || 'Upload failed',
        sessions_created: 0,
        sessions_updated: 0,
        errors: [error.message || 'Unknown error occurred']
      })
      toast.error('Upload failed')
    }
  }

  const downloadTemplate = () => {
    
    const csvContent = `title,description,start_time,end_time,location,speaker,session_type,capacity
"Opening Keynote","Welcome to the conference","2024-03-15T09:00:00","2024-03-15T10:00:00","Main Hall","John Doe","keynote",500
"React Best Practices","Learn modern React patterns","2024-03-15T10:30:00","2024-03-15T11:30:00","Room A","Jane Smith","workshop",50
"Networking Break","Coffee and networking","2024-03-15T11:30:00","2024-03-15T12:00:00","Lobby","","break",200`

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'schedule_template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule Management</h1>
          <p className="text-gray-600">Upload and manage event schedule data</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={downloadTemplate}
        >
          <Download className="w-4 h-4 mr-2" />
          Download Template
        </Button>
      </div>

      {}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Info className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">Upload Instructions</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Upload a CSV file with session data</p>
              <p>• Required columns: title, start_time, end_time, location</p>
              <p>• Optional columns: description, speaker, session_type, capacity</p>
              <p>• Date format: YYYY-MM-DDTHH:MM:SS (ISO 8601)</p>
              <p>• Session types: keynote, workshop, panel, networking, break</p>
            </div>
          </div>
        </div>
      </Card>

      {}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Schedule File</h3>
        
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-#60166b/100 bg-#60166b/10' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          
          {file ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-900">{file.name}</span>
              </div>
              <p className="text-sm text-gray-600">
                {(file.size / 1024).toFixed(1)} KB • {file.type || 'CSV file'}
              </p>
              <div className="flex gap-2 justify-center mt-4">
                <Button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="bg-#60166b hover:bg-#4d1157"
                >
                  {uploading ? 'Uploading...' : 'Upload Schedule'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setFile(null)}
                  disabled={uploading}
                >
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drag and drop your CSV file here
                </p>
                <p className="text-gray-600">or click to browse files</p>
              </div>
              
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
              >
                Choose File
              </label>
            </div>
          )}
        </div>

        {}
        {uploading && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Uploading...</span>
              <span className="text-sm text-gray-600">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {}
        {uploadResult && (
          <div className="mt-6">
            <div className={`p-4 rounded-lg ${
              uploadResult.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-start gap-3">
                {uploadResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <h4 className={`font-medium ${
                    uploadResult.success ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {uploadResult.message}
                  </h4>
                  
                  {uploadResult.success && (
                    <div className="mt-2 space-y-1 text-sm text-green-800">
                      <p>• {uploadResult.sessions_created} sessions created</p>
                      <p>• {uploadResult.sessions_updated} sessions updated</p>
                    </div>
                  )}
                  
                  {uploadResult.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-red-800 mb-1">Errors:</p>
                      <ul className="text-sm text-red-700 space-y-1">
                        {uploadResult.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Schedule Overview</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-900">57</p>
            <p className="text-sm text-blue-700">Total Sessions</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-900">3</p>
            <p className="text-sm text-green-700">Days</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <MapPin className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-900">8</p>
            <p className="text-sm text-purple-700">Locations</p>
          </div>
          
          <div className="text-center p-4 bg-#60166b/10 rounded-lg">
            <Users className="w-8 h-8 text-#60166b mx-auto mb-2" />
            <p className="text-2xl font-bold text-#4d1157">1,250</p>
            <p className="text-sm text-#4d1157">Total Capacity</p>
          </div>
        </div>

        {}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Session Types</h4>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-#60166b/20 text-#60166b">Keynote (5)</Badge>
            <Badge className="bg-blue-100 text-blue-800">Workshop (25)</Badge>
            <Badge className="bg-green-100 text-green-800">Panel (15)</Badge>
            <Badge className="bg-purple-100 text-purple-800">Networking (8)</Badge>
            <Badge className="bg-gray-100 text-gray-800">Break (4)</Badge>
          </div>
        </div>
      </Card>

      {}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Uploads</h3>
        
        <div className="space-y-3">
          {[
            {
              filename: 'conference_schedule_v2.csv',
              date: '2024-03-10',
              sessions: 57,
              status: 'success'
            },
            {
              filename: 'schedule_update.csv',
              date: '2024-03-08',
              sessions: 12,
              status: 'success'
            },
            {
              filename: 'initial_schedule.csv',
              date: '2024-03-05',
              sessions: 45,
              status: 'success'
            }
          ].map((upload, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">{upload.filename}</p>
                  <p className="text-sm text-gray-600">
                    {upload.sessions} sessions • {upload.date}
                  </p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Success
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default AdminSchedulePage