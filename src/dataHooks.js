import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabaseClient'

export const MEMBER_COLORS = {
  purple: { bg: 'var(--accent-light)', text: 'var(--accent-dark)' },
  teal: { bg: 'var(--teal-light)', text: 'var(--teal)' },
  coral: { bg: 'var(--coral-light)', text: 'var(--coral)' },
  blue: { bg: 'var(--blue-light)', text: 'var(--blue)' },
}

export function useMembers() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data, error } = await supabase.from('members').select('*').order('id')
    if (!error) setMembers(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  return { members, loading, refresh }
}

export function useMessages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true })
    if (!error) setMessages(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 3000)
    return () => clearInterval(interval)
  }, [refresh])

  const sendMessage = async (who, text) => {
    const { error } = await supabase.from('messages').insert({ who, text })
    if (!error) refresh()
    return error
  }

  return { messages, loading, sendMessage, refresh }
}

export function useTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setTasks(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
    const channel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, refresh)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [refresh])

  const addTask = async (task) => {
    const { error } = await supabase.from('tasks').insert(task)
    if (!error) refresh()
    return error
  }

  const updateTask = async (id, fields) => {
    const { error } = await supabase.from('tasks').update(fields).eq('id', id)
    if (!error) refresh()
    return error
  }

  const deleteTask = async (id) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (!error) refresh()
    return error
  }

  return { tasks, loading, addTask, updateTask, deleteTask, refresh }
}

export function useRoutines() {
  const [routines, setRoutines] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data, error } = await supabase
      .from('routines')
      .select('*')
      .order('time', { ascending: true })
    if (!error) setRoutines(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
    const channel = supabase
      .channel('routines-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'routines' }, refresh)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [refresh])

  const addRoutine = async (routine) => {
    const { error } = await supabase.from('routines').insert(routine)
    if (!error) refresh()
    return error
  }

  const deleteRoutine = async (id) => {
    const { error } = await supabase.from('routines').delete().eq('id', id)
    if (!error) refresh()
    return error
  }

  return { routines, loading, addRoutine, deleteRoutine, refresh }
}

export function useLeaves() {
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data, error } = await supabase
      .from('leaves')
      .select('*')
      .order('start_date', { ascending: false })
    if (!error) setLeaves(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
    const channel = supabase
      .channel('leaves-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leaves' }, refresh)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [refresh])

  const addLeave = async (leave) => {
    const { error } = await supabase.from('leaves').insert(leave)
    if (!error) refresh()
    return error
  }

  const deleteLeave = async (id) => {
    const { error } = await supabase.from('leaves').delete().eq('id', id)
    if (!error) refresh()
    return error
  }

  return { leaves, loading, addLeave, deleteLeave, refresh }
}

export function useDayNotes() {
  const [notes, setNotes] = useState({})
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data, error } = await supabase.from('day_notes').select('*')
    if (!error) {
      const map = {}
      ;(data || []).forEach(n => { map[n.date] = n })
      setNotes(map)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
    const channel = supabase
      .channel('day-notes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'day_notes' }, refresh)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [refresh])

  const saveNote = async (date, text) => {
    if (!text.trim()) {
      const { error } = await supabase.from('day_notes').delete().eq('date', date)
      if (!error) refresh()
      return error
    }
    const { error } = await supabase
      .from('day_notes')
      .upsert({ date, text: text.trim() }, { onConflict: 'date' })
    if (!error) refresh()
    return error
  }

  return { notes, loading, saveNote, refresh }
}

// returns list of YYYY-MM-DD strings between start and end inclusive
export function dateRange(start, end) {
  const dates = []
  const d = new Date(start)
  const last = new Date(end)
  while (d <= last) {
    dates.push(d.toISOString().slice(0, 10))
    d.setDate(d.getDate() + 1)
  }
  return dates
}

export function todayStr() {
  return new Date().toISOString().slice(0, 10)
}
