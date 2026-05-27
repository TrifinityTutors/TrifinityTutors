import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { clearAuthSession, useAuth } from "@/lib/auth"
import { Edit3, User, Image, LogOut } from "lucide-react"

export function ProfileDropdown({ userData, tutorData, onLogout }) {
  const { user: authUser, logout } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const user = userData || tutorData || authUser || {}
  const name = user?.name || user?.fullName || user?.firstName || user?.displayName || ""
  const image = user?.profilePhoto || user?.photo || user?.avatar || user?.image || ""
  const email = user?.email || ""

  const handleViewProfile = () => {
    setIsOpen(false)
    if (user?.role === "student") navigate("/student/profile")
    else navigate("/tutor-profile")
  }

  const handleEditProfile = () => {
    setIsOpen(false)
    if (user?.role === "student") navigate("/student/edit-profile")
    else navigate("/tutor-profile", { state: { scrollTo: "edit" } })
  }

  const handleChangePhoto = () => {
    setIsOpen(false)
    if (user?.role === "student") navigate("/student/edit-profile", { state: { openPhotoUpload: true } })
    else navigate("/tutor-profile", { state: { openPhotoUpload: true } })
  }

  const handleLogout = () => {
    setIsOpen(false)
    if (onLogout) {
      onLogout()
    } else if (logout) {
      logout()
    } else {
      clearAuthSession()
      window.location.href = "/"
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="relative h-9 w-9 rounded-full overflow-hidden hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 transition-all cursor-pointer flex-shrink-0"
          aria-label="Profile menu"
        >
          {image ? (
            <img
              src={image}
              alt={name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-semibold text-xs">
              {(name && name.charAt ? name.charAt(0).toUpperCase() : "U")}
            </div>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <DropdownMenuLabel className="font-semibold">{name}</DropdownMenuLabel>
          <p className="text-xs text-gray-500 truncate">{email}</p>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleViewProfile} className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>View Profile</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleEditProfile} className="cursor-pointer">
          <Edit3 className="mr-2 h-4 w-4" />
          <span>Edit Profile</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleChangePhoto} className="cursor-pointer">
          <Image className="mr-2 h-4 w-4" />
          <span>Change Photo</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
