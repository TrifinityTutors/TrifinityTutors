import React, { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import StudentAvatar from '@/components/StudentAvatar'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

export default function EditProfile(){
  const { user, token, refreshProfile } = useAuth()
  const [form, setForm] = useState({ name: '', bio: '', phone: '', preferredSubjects: '', location: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(()=>{
    if (!user) return
    setForm({
      name: user.name || '',
      bio: user.bio || '',
      phone: user.phone || '',
      preferredSubjects: Array.isArray(user.preferredSubjects) ? user.preferredSubjects.join(', ') : (user.preferredSubjects || ''),
      location: user.location || ''
    })
  },[user])

  async function handleSave(e){
    e.preventDefault()
    if (!token) return navigate('/auth/login')
    if (!form.name) return alert('Full name required')
    setLoading(true)
    try{
      const body = {
        name: form.name,
        bio: form.bio,
        phone: form.phone,
        preferredSubjects: form.preferredSubjects.split(',').map(s=>s.trim()).filter(Boolean),
        location: form.location
      }
      const res = await fetch('http://localhost:5000/api/students/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.message || 'Update failed')
      } else {
        const data = await res.json()
        if (refreshProfile) await refreshProfile()
        navigate('/student/profile')
      }
    } catch (err){
      console.error(err)
      alert('Update failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
      <div className="flex items-center gap-4 mb-6">
        <StudentAvatar user={user} size={72} />
        <div>
          <p className="font-medium">{user?.email}</p>
          <p className="text-sm text-muted-foreground">Change avatar via image URL below</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Full name</label>
          <input value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Bio</label>
          <textarea value={form.bio} onChange={e=>setForm({...form, bio: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2" rows={4} />
        </div>
        <div>
          <label className="block text-sm font-medium">Phone</label>
          <input value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Preferred subjects (comma separated)</label>
          <input value={form.preferredSubjects} onChange={e=>setForm({...form, preferredSubjects: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Location</label>
          <input value={form.location} onChange={e=>setForm({...form, location: e.target.value})} className="mt-1 block w-full rounded border px-3 py-2" />
        </div>

        <div className="flex items-center gap-2">
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save changes'}</Button>
          <Button variant="ghost" onClick={()=>navigate('/student/profile')}>Cancel</Button>
        </div>
      </form>
    </div>
  )
}
