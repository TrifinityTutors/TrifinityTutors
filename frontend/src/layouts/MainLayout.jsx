import Navbar from "../components/Navbar"

function MainLayout({ children }) {
  return (
    <div className="bg-gradient-soft min-h-screen text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}

export default MainLayout