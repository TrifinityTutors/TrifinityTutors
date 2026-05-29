import Navbar from "../components/Navbar"
import { Footer } from "../components/Footer"
import { motion } from "framer-motion"

function MainLayout({ children }) {
  return (
    <div className="bg-background min-h-screen text-foreground">
      <Navbar />

      <motion.main
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        {children}
      </motion.main>

      <Footer />
    </div>
  )
}

export default MainLayout