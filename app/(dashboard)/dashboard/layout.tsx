'use client'

import { useState } from 'react'
import DashboardSidebar from '@/components/dashboard/sidebar'
import DashboardNavbar from '@/components/dashboard/navbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-legal-bg-primary via-warm-100 to-legal-bg-secondary">
      {/* Sidebar */}
      <DashboardSidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
      />
      
      {/* Main Content */}
      <div className="lg:ml-72">
        {/* Top Navigation */}
        <DashboardNavbar 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
        />
        
        {/* Page Content */}
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}