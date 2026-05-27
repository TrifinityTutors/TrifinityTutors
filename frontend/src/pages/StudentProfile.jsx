import React, { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import StudentAvatar from '@/components/StudentAvatar'
import { Button } from '@/components/ui/button'
import { Link, useNavigate } from 'react-router-dom'

export default function StudentProfile() {
  const { user, token, refreshProfile } = useAuth()
  const [profile, setProfile] = useState(user)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      if (!token) return navigate('/auth/login')
      setLoading(true)
      try {
        const res = await fetch('http://localhost:5000/api/students/profile', { headers: { Authorization: `Bearer ${token}` } })
        if (res.ok) {
          const data = await res.json()
          setProfile(data.profile || data.user || data)
        }
      } catch (err) {
        console.error(err)
      } finally { setLoading(false) }
    }
    load()
  }, [token, navigate])

  if (!profile) return <div>Loading...</div>

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <StudentAvatar user={profile} size={72} />
        <div>
          <h1 className="text-2xl font-semibold">{profile.name}</h1>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
          <p className="text-xs text-muted-foreground">Joined: {new Date(profile.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="ml-auto">
          <Button asChild>
            <Link to="/student/edit-profile">Edit profile</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">About</h3>
            <p className="text-sm">{profile.bio || 'No bio provided.'}</p>
          </div>

          <div className="mt-4 p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Booked Sessions</h3>
            {Array.isArray(profile.bookedSessions) && profile.bookedSessions.length > 0 ? (
              <ul className="text-sm space-y-2">
                {profile.bookedSessions.map((s,i)=> (
                  <li key={i} className="p-2 border rounded">{JSON.stringify(s)}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No sessions booked yet.</p>
            )}
          </div>
        </div>

        <div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Contact</h3>
            <p className="text-sm">Phone: {profile.phone || '—'}</p>
            <p className="text-sm">Location: {profile.location || '—'}</p>
          </div>

          <div className="mt-4 p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Saved Tutors</h3>
            {Array.isArray(profile.savedTutors) && profile.savedTutors.length>0 ? (
              <ul className="text-sm">
                {profile.savedTutors.map((t,i)=> <li key={i}>{t.name || t}</li>)}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No saved tutors.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
