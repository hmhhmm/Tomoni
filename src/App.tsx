import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useStore } from './store'
import i18n from './i18n'
import { AppShell } from './components/AppShell'
import Welcome from './screens/Welcome'
import { HostHome } from './screens/host/HostHome'
import { CreateListing } from './screens/host/CreateListing'
import { HelpPicker } from './screens/host/HelpPicker'
import { Applicants } from './screens/host/Applicants'
import { Meeting } from './screens/host/Meeting'
import { CheckIn } from './screens/host/CheckIn'
import { Pact } from './screens/Pact'
import { Chat } from './screens/Chat'
import { Onboarding } from './screens/tenant/Onboarding'
import { Browse } from './screens/tenant/Browse'
import { ListingDetail } from './screens/tenant/ListingDetail'
import { TaskLog } from './screens/tenant/TaskLog'
import { Pulse } from './screens/tenant/Pulse'
import { Me } from './screens/tenant/Me'
import { FamilyInvite } from './screens/family/FamilyInvite'
import { FamilyDashboard } from './screens/family/FamilyDashboard'
import { Safety } from './screens/Safety'
import { Coordinator } from './screens/Coordinator'

export default function App() {
  const lang = useStore((s) => s.lang)
  const { pathname } = useLocation()
  useEffect(() => {
    document.documentElement.lang = lang
    i18n.changeLanguage(lang)
  }, [lang])
  useEffect(() => {
    if (pathname === '/coordinator') document.documentElement.style.fontSize = '16px'
  }, [pathname])
  return (
    <Routes>
      <Route path="/coordinator" element={<Coordinator />} />
      <Route element={<AppShell />}>
        <Route path="/" element={<Welcome />} />
        <Route path="/host/home" element={<HostHome />} />
        <Route path="/host/create" element={<CreateListing />} />
        <Route path="/host/help" element={<HelpPicker />} />
        <Route path="/host/applicants" element={<Applicants />} />
        <Route path="/trial" element={<Meeting />} />
        <Route path="/host/checkin" element={<CheckIn />} />
        <Route path="/pact" element={<Pact />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/tenant/onboarding" element={<Onboarding />} />
        <Route path="/tenant/browse" element={<Browse />} />
        <Route path="/tenant/listing/:id" element={<ListingDetail />} />
        <Route path="/tenant/tasks" element={<TaskLog />} />
        <Route path="/tenant/pulse" element={<Pulse />} />
        <Route path="/tenant/me" element={<Me />} />
        <Route path="/family/invite" element={<FamilyInvite />} />
        <Route path="/family/dashboard" element={<FamilyDashboard />} />
        <Route path="/safety" element={<Safety />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
