import { Routes, Route, Navigate, useParams } from 'react-router'
import { isLevel } from './lib/exam'
import Landing from './pages/Landing'
import Home from './pages/Home'

function LevelGate() {
  const { level } = useParams()
  if (!isLevel(level)) return <Navigate to="/" replace />
  return <Home level={level} />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/:level" element={<LevelGate />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
