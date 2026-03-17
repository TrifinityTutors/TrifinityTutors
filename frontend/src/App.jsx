import { BrowserRouter, Routes, Route } from "react-router-dom"

import Home from "./pages/Home"
import StudentRegister from "./pages/StudentRegister"
import TutorRegister from "./pages/TutorRegister"
import TutorDashboard from "./pages/TutorDashboard"

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/student-register" element={<StudentRegister />} />
        <Route path="/tutor-register" element={<TutorRegister />} />
        <Route path="/dashboard" element={<TutorDashboard />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App