import { Link } from "react-router-dom"
import { useState } from "react"
import homeUIImage from "../assets/homeUI.png"

function Home() {
  const [searchSubject, setSearchSubject] = useState("")
  const [searchLocation, setSearchLocation] = useState("")
  const [activeFAQ, setActiveFAQ] = useState(null)

  // Sample data
  const popularSubjects = [
    { id: 1, name: "Mathematics", icon: "📐", students: "2.5K+" },
    { id: 2, name: "Science", icon: "🔬", students: "2.1K+" },
    { id: 3, name: "English", icon: "📖", students: "1.8K+" },
    { id: 4, name: "Physics", icon: "⚛️", students: "1.5K+" },
    { id: 5, name: "Chemistry", icon: "🧪", students: "1.3K+" },
    { id: 6, name: "Biology", icon: "🧬", students: "1.1K+" },
  ]

  const tutors = [
    {
      id: 1,
      name: "Sarah Johnson",
      subject: "Mathematics",
      rating: 4.9,
      reviews: 156,
      image: "👩‍🏫",
      price: "₹500/hr",
      badge: "Verified"
    },
    {
      id: 2,
      name: "Michael Chen",
      subject: "Physics",
      rating: 4.8,
      reviews: 142,
      image: "👨‍🏫",
      price: "₹550/hr",
      badge: "Top Rated"
    },
    {
      id: 3,
      name: "Emily Watson",
      subject: "English",
      rating: 4.9,
      reviews: 178,
      image: "👩‍🏫",
      price: "₹450/hr",
      badge: "Verified"
    },
    {
      id: 4,
      name: "David Kumar",
      subject: "Chemistry",
      rating: 4.7,
      reviews: 128,
      image: "👨‍🏫",
      price: "₹500/hr",
      badge: "New"
    },
  ]

  const testimonials = [
    {
      id: 1,
      name: "Priya Singh",
      role: "Class 12 Student",
      content: "Trifinity helped me find the perfect tutor for my physics exam. My score improved by 45 points!",
      rating: 5,
      image: "👧"
    },
    {
      id: 2,
      name: "Rahul Patel",
      role: "Parent",
      content: "Professional service, verified tutors, and flexible timing. Highly recommended for serious learners.",
      rating: 5,
      image: "👨"
    },
    {
      id: 3,
      name: "Ananya Desai",
      role: "College Student",
      content: "Found an excellent math tutor who explains concepts so clearly. Worth every rupee!",
      rating: 5,
      image: "👩"
    },
  ]

  const faqs = [
    {
      id: 1,
      question: "How do I find a tutor?",
      answer: "Use our search feature to find tutors by subject and location. Filter by rating, price, and availability to find the perfect match."
    },
    {
      id: 2,
      question: "Are all tutors verified?",
      answer: "We verify all our tutors through background checks and credential verification. Look for the 'Verified' badge on tutor profiles."
    },
    {
      id: 3,
      question: "What are the payment options?",
      answer: "We accept all major payment methods including UPI, credit cards, debit cards, and net banking for secure transactions."
    },
    {
      id: 4,
      question: "Can I change my tutor?",
      answer: "Yes, you can change your tutor anytime. We offer a satisfaction guarantee and help you find a better match if needed."
    },
    {
      id: 5,
      question: "Do you offer online tutoring?",
      answer: "Yes, we offer both online and home tutoring options. Filter by 'Online' in location to find online tutors."
    },
  ]

  return (
    <div className="w-full">
      {/* HERO SECTION */}
      <section className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50">
        {/* Animated Background Gradient - Positioned absolutely to cover full screen */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-white to-blue-50"></div>
        <div className="absolute top-0 -left-40 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 -right-40 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 -z-10 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-10 -z-10"></div>

        <div className="w-full h-full flex items-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl w-full mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Content */}
              <div className="flex flex-col justify-center">
                <div className="inline-block mb-4 sm:mb-6 px-4 py-2 bg-blue-100 rounded-full w-fit">
                  <p className="text-blue-700 font-semibold text-xs sm:text-sm">✨ Trusted by 50,000+ Learners</p>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                  Find the Perfect
                  <span className="block bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent"> Tutor Near You</span>
                </h1>

                <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed max-w-xl">
                  Trifinity connects students with passionate college tutors for personalized, affordable learning — at home or online.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12">
                  <Link to="/student-register" className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg sm:rounded-xl font-bold text-base sm:text-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-center">
                    🔍 Find a Tutor
                    <span className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 opacity-0 group-hover:opacity-100 blur transition-opacity duration-300 -z-10"></span>
                  </Link>
                  <Link to="/tutor-login" className="px-6 sm:px-8 py-3 sm:py-4 bg-gray-100 text-gray-900 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg hover:bg-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center">
                    👨‍🏫 Become a Tutor
                  </Link>
                </div>

                {/* Rating */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                  <div className="flex gap-1 sm:gap-2">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-lg sm:text-2xl">⭐</span>
                    ))}
                  </div>
                  <div>
                    <p className="text-gray-700 font-semibold text-sm sm:text-base">4.9/5.0</p>
                    <p className="text-gray-600 text-xs sm:text-sm">12K+ Reviews</p>
                  </div>
                </div>
              </div>

              {/* Right Image with Floating Animation */}
              <div className="relative flex justify-center items-center hidden lg:flex">
                <style>{`
                  @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-30px); }
                  }
                  .floating-image {
                    animation: float 6s ease-in-out infinite;
                  }
                `}</style>

                <div className="relative w-full flex justify-center">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-500 rounded-3xl blur-3xl opacity-20 -z-10"></div>

                  {/* Image Container */}
                  <img
                    src={homeUIImage}
                    alt="Verified Tutor - Find tutors online"
                    className="floating-image w-full max-w-md h-auto drop-shadow-2xl rounded-3xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH SECTION */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8 text-center">Start Your Learning Journey</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="lg:col-span-2">
                <label className="block text-white text-xs sm:text-sm font-semibold mb-2">What do you want to learn?</label>
                <input
                  type="text"
                  placeholder="e.g., Mathematics, Physics..."
                  value={searchSubject}
                  onChange={(e) => setSearchSubject(e.target.value)}
                  className="w-full px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-white/90 backdrop-blur text-gray-900 placeholder-gray-500 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-white text-xs sm:text-sm font-semibold mb-2">Location / Online</label>
                <input
                  type="text"
                  placeholder="e.g., Delhi, Mumbai..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-white/90 backdrop-blur text-gray-900 placeholder-gray-500 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-white text-xs sm:text-sm font-semibold mb-2">&nbsp;</label>
                <button className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-white text-blue-600 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base hover:bg-gray-100 hover:shadow-lg transition-all duration-300">
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR SUBJECTS */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Popular Subjects</h2>
            <p className="text-lg sm:text-xl text-gray-600">Explore thousands of tutors across various subjects</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {popularSubjects.map((subject) => (
              <Link key={subject.id} to="/student-register" className="group">
                <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-2 h-full">
                  <div className="text-5xl sm:text-6xl mb-4">{subject.icon}</div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{subject.name}</h3>
                  <p className="text-sm sm:text-base text-gray-600 font-semibold">{subject.students} students</p>
                  <div className="mt-4 pt-4 border-t border-gray-200 flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all duration-300 text-sm sm:text-base">
                    Browse tutors
                    <span className="ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED TUTORS */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Featured Tutors</h2>
            <p className="text-lg sm:text-xl text-gray-600">Meet our top-rated and verified tutors</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {tutors.map((tutor) => (
              <div key={tutor.id} className="group bg-gradient-to-br from-white to-blue-50 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-6 text-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-white transition-opacity duration-300"></div>
                  <div className="text-5xl sm:text-6xl mb-2">{tutor.image}</div>
                  <span className="inline-block px-3 py-1 bg-white/90 text-blue-600 text-xs font-bold rounded-full">{tutor.badge}</span>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 flex flex-col flex-grow">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">{tutor.name}</h3>
                  <p className="text-blue-600 font-semibold mb-4 text-sm sm:text-base">{tutor.subject}</p>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4 text-sm sm:text-base">
                    <span className="text-yellow-400">⭐</span>
                    <span className="font-bold text-gray-900">{tutor.rating}</span>
                    <span className="text-gray-500 text-xs sm:text-sm">({tutor.reviews})</span>
                  </div>

                  {/* Price */}
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">{tutor.price}</p>

                  {/* CTA */}
                  <Link to="/student-register" className="block w-full px-4 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg sm:rounded-lg font-bold hover:shadow-lg transition-all duration-300 text-center text-sm sm:text-base mt-auto">
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10 sm:mt-12">
            <Link to="/student-register" className="inline-block px-6 sm:px-8 py-3 sm:py-4 border-2 border-blue-600 text-blue-600 font-bold rounded-lg sm:rounded-xl hover:bg-blue-50 transition-all duration-300 text-sm sm:text-base">
              View All Tutors →
            </Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">What Our Users Say</h2>
            <p className="text-lg sm:text-xl text-gray-600">Join thousands of satisfied students and parents</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-lg sm:text-xl">⭐</span>
                  ))}
                </div>

                {/* Content */}
                <p className="text-gray-700 mb-6 leading-relaxed italic text-sm sm:text-base">"{testimonial.content}"</p>

                {/* Author */}
                <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                  <div className="text-3xl sm:text-4xl">{testimonial.image}</div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm sm:text-base">{testimonial.name}</p>
                    <p className="text-gray-600 text-xs sm:text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Frequently Asked Questions</h2>
            <p className="text-lg sm:text-xl text-gray-600">Find answers to common questions about Trifinity</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="border border-gray-200 rounded-lg sm:rounded-xl overflow-hidden hover:border-blue-300 transition-colors duration-300">
                <button
                  onClick={() => setActiveFAQ(activeFAQ === faq.id ? null : faq.id)}
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors duration-300"
                >
                  <span className="text-base sm:text-lg font-bold text-gray-900 text-left">{faq.question}</span>
                  <span className={`text-xl sm:text-2xl transition-transform duration-300 ${activeFAQ === faq.id ? "rotate-180" : ""} flex-shrink-0 ml-4`}>▼</span>
                </button>

                {activeFAQ === faq.id && (
                  <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200 animate-in fade-in">
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-10 sm:mt-12 text-center">
            <p className="text-gray-600 mb-4 text-sm sm:text-base">Still have questions?</p>
            <a href="mailto:support@trifinity.com" className="inline-block px-6 sm:px-8 py-3 sm:py-4 bg-gray-900 text-white rounded-lg sm:rounded-xl font-bold hover:bg-gray-800 transition-colors duration-300 text-sm sm:text-base">
              Contact Our Support Team
            </a>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-blue-600 to-blue-700 relative overflow-hidden">
        <div className="absolute top-10 right-10 w-80 sm:w-96 h-80 sm:h-96 bg-white/10 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">Ready to Transform Your Learning?</h2>
          <p className="text-base sm:text-lg lg:text-xl text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto">Join thousands of students who have improved their grades and confidence with our verified tutors.</p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link to="/student-register" className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 rounded-lg sm:rounded-xl font-bold hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-sm sm:text-base text-center">
              Start Learning Today
            </Link>
            <Link to="/tutor-login" className="px-6 sm:px-8 py-3 sm:py-4 bg-blue-500 text-white rounded-lg sm:rounded-xl font-bold hover:bg-blue-400 transition-all duration-300 hover:-translate-y-1 text-sm sm:text-base text-center">
              Join as a Tutor
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl font-bold">T</span>
                </div>
                <span className="font-bold text-white text-lg">Trifinity</span>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed">Connecting students with expert tutors for personalized learning experiences.</p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-bold text-white mb-4 text-sm sm:text-base">For Students</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><Link to="/student-register" className="hover:text-white transition-colors">Find a Tutor</Link></li>
                <li><Link to="/student-register" className="hover:text-white transition-colors">How It Works</Link></li>
                <li><Link to="/student-register" className="hover:text-white transition-colors">Subjects</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4 text-sm sm:text-base">For Tutors</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><Link to="/tutor-login" className="hover:text-white transition-colors">Become a Tutor</Link></li>
                <li><Link to="/tutor-login" className="hover:text-white transition-colors">Tutor Benefits</Link></li>
                <li><Link to="/tutor-login" className="hover:text-white transition-colors">Sign In</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4 text-sm sm:text-base">Company</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms & Conditions</a></li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-800 pt-6 sm:pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm gap-4">
              <p>&copy; 2024 Trifinity Tutors. All rights reserved.</p>
              <div className="flex gap-4">
                <a href="#" className="hover:text-white transition-colors">Facebook</a>
                <a href="#" className="hover:text-white transition-colors">Twitter</a>
                <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home