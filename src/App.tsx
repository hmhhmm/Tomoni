import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useStore } from './store'
import i18n from './i18n'
import { AppShell } from './components/layout/AppShell'
import { Landing } from './screens/Landing'
import { Explore } from './screens/tenant/Explore'
import { ListingDetail } from './screens/tenant/ListingDetail'
import { Saved } from './screens/tenant/Saved'
import { Log } from './screens/tenant/Log'
import { Account } from './screens/tenant/Account'
import { Verify } from './screens/tenant/Verify'
import { Pulse } from './screens/tenant/Pulse'
import { HostToday } from './screens/host/Today'
import { People } from './screens/host/People'
import { CreateListing } from './screens/host/CreateListing'
import { HelpPicker } from './screens/host/HelpPicker'
import { CheckIn } from './screens/host/CheckIn'
import { Messages } from './screens/Messages'
import { Stay } from './screens/Stay'
import { Agreement } from './screens/Agreement'
import { FamilyDashboard, FamilyInvite } from './screens/family/Family'
import { Safety } from './screens/Safety'
import { Coordinator } from './screens/Coordinator'

export default function App() {
  const lang = useStore((s) => s.lang)
  useEffect(() => {
    document.documentElement.lang = lang
    i18n.changeLanguage(lang)
  }, [lang])

  return (
    <Routes>
      <Route path="/coordinator" element={<Coordinator />} />
      <Route element={<AppShell />}>
        <Route path="/" element={<Landing />} />
        <Route path="/host" element={<HostToday />} />
        <Route path="/host/people" element={<People />} />
        <Route path="/host/create" element={<Navigate to="/host/create/1" replace />} />
        <Route path="/host/create/:step" element={<CreateListing />} />
        <Route path="/host/help" element={<HelpPicker />} />
        <Route path="/host/checkin" element={<CheckIn />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/messages/:id" element={<Messages />} />
        <Route path="/stay" element={<Stay />} />
        <Route path="/agreement" element={<Agreement />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/rooms/:id" element={<ListingDetail />} />
        <Route path="/saved" element={<Saved />} />
        <Route path="/log" element={<Log />} />
        <Route path="/account" element={<Account />} />
        <Route path="/account/verify" element={<Verify />} />
        <Route path="/pulse" element={<Pulse />} />
        <Route path="/family" element={<FamilyDashboard />} />
        <Route path="/family/invite" element={<FamilyInvite />} />
        <Route path="/safety" element={<Safety />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
