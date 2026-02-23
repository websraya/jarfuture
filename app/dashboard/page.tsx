'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Note = {
  id: string
  title: string
  content: string
  created_at: string
}

export default function Dashboard() {
  const [notes, setNotes] = useState<Note[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [dark, setDark] = useState(false)
  const [search, setSearch] = useState('')
  const [showNote, setShowNote] = useState<Note | null>(null)

  // Load theme
  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') {
      document.documentElement.classList.add('dark')
      setDark(true)
    }
  }, [])

  const toggleDark = () => {
    const isDark = document.documentElement.classList.contains('dark')

    if (isDark) {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
      setDark(false)
    } else {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
      setDark(true)
    }
  }

  // Fetch notes
  const fetchNotes = async () => {
    const { data } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false })

    setNotes(data || [])
  }

  useEffect(() => {
    fetchNotes()
  }, [])

  // Save note
  const saveNote = async () => {
    if (!title || !content) return

    if (editingId) {
      await supabase
        .from('notes')
        .update({ title, content })
        .eq('id', editingId)
      setEditingId(null)
    } else {
      await supabase.from('notes').insert({ title, content })
    }

    setTitle('')
    setContent('')
    fetchNotes()
  }

  // Delete
  const deleteNote = async (id: string) => {
    await supabase.from('notes').delete().eq('id', id)
    fetchNotes()
  }

  // Edit
  const editNote = (note: Note) => {
    setTitle(note.title)
    setContent(note.content)
    setEditingId(note.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Filter
  const filteredNotes = notes.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen animate-fade">

      {/* HEADER */}
      <header className="sticky top-0 theme-card p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Halo Jar!
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Udah merasa hidup hari ini?
          </p>
        </div>

        <button
          onClick={toggleDark}
          className="px-3 py-1 rounded border border-gray-300 dark:border-gray-700 hover:opacity-80 transition"
        >
          {dark ? 'Light' : 'Dark'}
        </button>
      </header>

      {/* CONTENT */}
      <div className="max-w-2xl mx-auto p-4">

        {/* FORM */}
        <div className="theme-card p-4 rounded-xl shadow-sm mb-6">
          <input
            placeholder="Title"
            className="w-full mb-2 p-2 rounded theme-input outline-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            placeholder="Write something..."
            className="w-full mb-3 p-2 rounded theme-input outline-none"
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                saveNote()
              }
            }}
          />

          <button
            onClick={saveNote}
            className="bg-[#212121] dark:bg-white dark:text-black text-white px-4 py-2 rounded hover:opacity-90 transition"
          >
            {editingId ? 'Update' : 'Save'}
          </button>
        </div>

        {/* SEARCH */}
        <input
          placeholder="Search notes..."
          className="w-full mb-4 p-2 rounded theme-input outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* NOTES */}
        <div className="space-y-4">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="theme-card p-4 rounded-xl shadow-sm animate-fade"
            >
              <div className="flex justify-between items-start mb-2">
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  {note.title}
                </h2>

                <div className="space-x-3 text-sm">
                  <button
                    onClick={() => setShowNote(note)}
                    className="hover:opacity-70"
                  >
                    Show
                  </button>

                  <button
                    onClick={() => editNote(note)}
                    className="hover:opacity-70"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteNote(note.id)}
                    className="text-red-500 hover:opacity-70"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <p className="whitespace-pre-line text-gray-700 dark:text-gray-300 mb-2">
                {note.content}
              </p>

              <p className="text-xs text-gray-400">
                {new Date(note.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {showNote && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="theme-card max-w-lg w-full p-6 rounded-xl shadow-lg relative">

            <button
              onClick={() => setShowNote(null)}
              className="absolute top-3 right-3 text-sm text-gray-500 hover:opacity-70"
            >
              Close
            </button>

            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {showNote.title}
            </h2>

            <p className="whitespace-pre-line text-gray-700 dark:text-gray-300 mb-4">
              {showNote.content}
            </p>

            <p className="text-xs text-gray-400">
              {new Date(showNote.created_at).toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}