import { useState } from "react";
import axios from "axios";
import "./CompleteProfile.css"

export default function CompleteProfile() {
  const [formData, setFormData] = useState({
    subject: "",
    locality: "",
    experience: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await axios.post(
        "http://localhost:5000/api/tutor/complete-profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      alert("Profile completed successfully!");

      window.location.href = "/tutor-dashboard";

    } catch (err) {
      console.error(err);
      alert("Failed to complete profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="complete-profile-container">
      <div className="complete-profile-wrapper">
        <div className="profile-header">
          <h1>Complete Your Tutor Profile</h1>
          <p className="subtitle">Let students know more about you</p>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          
          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input
              id="subject"
              type="text"
              name="subject"
              placeholder="e.g., Mathematics, Physics"
              value={formData.subject}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="experience">Experience (Years)</label>
              <input
                id="experience"
                type="number"
                name="experience"
                placeholder="e.g., 5"
                value={formData.experience}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="tel"
                name="phone"
                placeholder="10-digit number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="locality">Location / Locality</label>
            <input
              id="locality"
              type="text"
              name="locality"
              placeholder="Where are you located?"
              value={formData.locality}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="submit-btn"
          >
            {loading ? "Completing Profile..." : "Complete Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}