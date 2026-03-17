import { BrowserRouter, Routes, Route } from "react-router-dom"

import Home from "./pages/Home"
import StudentRegister from "./pages/StudentRegister"
import TutorRegister from "./pages/TutorRegister"

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/student-register" element={<StudentRegister />} />
        <Route path="/tutor-register" element={<TutorRegister />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App