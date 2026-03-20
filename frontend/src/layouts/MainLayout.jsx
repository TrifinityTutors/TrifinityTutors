import Navbar from "../components/Navbar"

function MainLayout({ children }) {
  return (
    <div className="bg-[#0f172a] min-h-screen text-white">

      {/* Navbar */}
      <Navbar />

      {/* Page Content */}
      <div className="px-6 py-6">
        {children}
      </div>

    </div>
  )
}

export default MainLayout
