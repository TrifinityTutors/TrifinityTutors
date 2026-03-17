import { Link } from "react-router-dom"

function Home() {
  return (
    <div>

      <h1>Trifinity Tutors</h1>

      <h3>Find Home Tutors in Your Area</h3>

      <Link to="/student-register">
        <button>Register as Student</button>
      </Link>

      <br /><br />

      <Link to="/tutor-register">
        <button>Register as Tutor</button>
      </Link>

    </div>
  )
}

export default Home