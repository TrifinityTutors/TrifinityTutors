import { Link } from "react-router-dom"
import "./Home.css"

function Home() {
  return (
    <div className="home-container">
      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Find the Perfect Home Tutor
          </h1>

          <p className="hero-subtitle">
            Connect with experienced tutors near you and boost your learning experience.
          </p>

          {/* CTA BUTTONS */}
          <div className="cta-buttons">
            <Link to="/student-register" className="btn btn-student">
              📚 Register as Student
            </Link>

            <Link to="/tutor-login" className="btn btn-tutor">
              👨‍🏫 Register as Tutor
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="features-section">
        <h2 className="section-title">Why Choose Trifinity Tutors?</h2>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">✓</div>
            <h3>Verified Tutors</h3>
            <p>Learn from experienced and verified teachers with proven track records.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⏱️</div>
            <h3>Flexible Learning</h3>
            <p>Choose your schedule and preferred learning style that works for you.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Affordable Pricing</h3>
            <p>Find tutors that fit your budget without compromising quality.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home