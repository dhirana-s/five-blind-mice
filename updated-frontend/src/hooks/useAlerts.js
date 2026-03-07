import { supabase } from '../lib/supabase.js'  // Adjust path if needed
import { useEffect, useState } from 'react'
console.log('useAlerts: Supabase imported successfully')

export function useAlerts() {
  const [alerts, setAlerts]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    fetchAlerts()

    const channel = supabase
      .channel('alert_incidents_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'alert_incidents'
      }, () => {
        fetchAlerts()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function fetchAlerts() {
    try {
      const { data, error } = await supabase
        .from('alert_incidents')
        .select(`
          *,
          senior:seniors(*),
          forensics:agent_forensics(*),
          dispatch_actions(*)
        `)
        .in('status', ['Pending', 'Dispatched'])
        .order('start_time', { ascending: false })

      if (error) throw error
      setAlerts(data ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(incident_id, status) {
    const { error } = await supabase
      .from('alert_incidents')
      .update({ status })
      .eq('incident_id', incident_id)

    if (error) console.error('Status update failed:', error)
    else fetchAlerts()
  }

  async function submitFeedback(incident_id, feedback) {
    const { error } = await supabase
      .from('incident_feedback')
      .insert({ incident_id, ...feedback })

    if (error) console.error('Feedback submit failed:', error)
  }

  return { alerts, loading, error, updateStatus, submitFeedback, refetch: fetchAlerts }
}