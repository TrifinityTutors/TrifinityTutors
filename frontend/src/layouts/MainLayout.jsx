import Navbar from "../components/Navbar"

function MainLayout({ children }) {
  return (
    <div className="bg-gray-100 min-h-screen">

      {/* Navbar */}
      <Navbar />

      {/* Page Content */}
      <div className="max-w-6xl mx-auto p-6">
        {children}
      </div>

    </div>
  )
}

export default MainLayout