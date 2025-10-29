import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AdminRoute } from '@/components/AdminRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import AdminLayout from '@/components/layout/AdminLayout'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import ProfileSetupPage from '@/pages/ProfileSetupPage'
import ProfilePage from '@/pages/ProfilePage'
import DashboardPage from '@/pages/DashboardPage'
import SchedulePage from '@/pages/SchedulePage'
import SessionDetailPage from '@/pages/SessionDetailPage'
import FeedbackPage from '@/pages/FeedbackPage'
import NetworkingPage from '@/pages/NetworkingPage'
import PollsPage from '@/pages/PollsPage'
import PartnersPage from '@/pages/PartnersPage'
import AdminDashboardPage from '@/pages/AdminDashboardPage'
import AdminUsersPage from '@/pages/AdminUsersPage'
import AdminAnnouncementsPage from '@/pages/AdminAnnouncementsPage'
import AdminNotificationsPage from '@/pages/AdminNotificationsPage'
import AdminSchedulePage from '@/pages/AdminSchedulePage'
import AdminAnalyticsPage from '@/pages/AdminAnalyticsPage'
import AdminPollsPage from '@/pages/AdminPollsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/profile-setup',
    element: <ProfileSetupPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'schedule',
        element: <SchedulePage />,
      },
      {
        path: 'session/:sessionId',
        element: <SessionDetailPage />,
      },
      {
        path: 'feedback/:sessionId',
        element: <FeedbackPage />,
      },
      {
        path: 'networking',
        element: <NetworkingPage />,
      },
      {
        path: 'polls',
        element: <PollsPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'partners',
        element: <PartnersPage />,
      },
    ],
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminRoute>
          <AdminLayout />
        </AdminRoute>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <AdminDashboardPage />,
      },
      {
        path: 'users',
        element: <AdminUsersPage />,
      },
      {
        path: 'announcements',
        element: <AdminAnnouncementsPage />,
      },
      {
        path: 'notifications',
        element: <AdminNotificationsPage />,
      },
      {
        path: 'schedule',
        element: <AdminSchedulePage />,
      },
      {
        path: 'analytics',
        element: <AdminAnalyticsPage />,
      },
      {
        path: 'polls',
        element: <AdminPollsPage />,
      },
    ],
  },
])