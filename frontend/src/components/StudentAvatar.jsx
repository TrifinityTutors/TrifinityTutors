import React from 'react'

export default function StudentAvatar({ user, size = 40, className = '' }) {
  const name = user?.name || 'Student'
  const img = user?.avatar || user?.photo || ''
  const initials = name.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase()

  return (
    <div className={`rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-500 text-white ${className}`} style={{ width: size, height: size }}>
      {img ? (
        <img src={img} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span className="font-semibold text-sm">{initials}</span>
      )}
    </div>
  )
}
