import React from 'react'
import SystemHealthMonitor from '@/components/admin/SystemHealthMonitor'

const AdminSystemPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Status</h1>
        <p className="text-gray-600">Monitor system health and performance metrics</p>
      </div>

      <SystemHealthMonitor />
    </div>
  )
}

export default AdminSystemPage