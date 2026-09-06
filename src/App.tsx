import { useState } from 'react'
import { Routes, Route, Navigate, useParams } from 'react-router'
import { isLevel } from './lib/exam'
import { getUser } from './lib/store'
import Login from './pages/Login'
import Landing from './pages/Landing'
import Home from './pages/Home'

function LevelGate() {
  const { level } = useParams()
  if (!isLevel(level)) return <Navigate to="/" replace />
  return <Home level={level} />
}

export default function App() {
  const [user, setUserState] = useState<string | null>(() => getUser())

  if (!user) return <Login onLogin={setUserState} />

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/:level" element={<LevelGate />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
