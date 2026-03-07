import { useAlerts } from './hooks/useAlerts'
import PABDashboard from './components/PABDashboard'

export default function App() {
  const { alerts, loading, error, updateStatus } = useAlerts()

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
      height:'100vh', fontFamily:'monospace', color:'#64748b' }}>
      Loading alerts...
    </div>
  )

  if (error) return (
    <div style={{ padding:32, color:'#b91c1c' }}>
      Error connecting to Supabase: {error}
    </div>
  )

  return <PABDashboard alerts={alerts} onStatusChange={updateStatus} />
}
