import { useState } from "react"

function TutorRegister() {

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    subject: "",
    locality: "",
    experience: "",
    phone: ""
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

 const handleSubmit = async (e) => {
  e.preventDefault();

  try {

    const response = await fetch("http://localhost:5000/api/tutor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}` // 🔥 ADD THIS
      },
      body: JSON.stringify(form)
    });

    const data = await response.json();

    alert(data.message || "Registered successfully");

    setForm({
      name: "",
      email: "",
      subject: "",
      locality: "",
      experience: "",
      phone: ""
    });

  } catch (error) {
    console.error(error);
    alert("Error registering tutor");
  }
};

  return (
    <div>

      <h2>Tutor Registration</h2>

      <form onSubmit={handleSubmit}>

        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
        />
        <br /><br />

        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        <br /><br />

        <input
          name="subject"
          placeholder="Subject"
          value={form.subject}
          onChange={handleChange}
        />
        <br /><br />

        <input
          name="locality"
          placeholder="Locality"
          value={form.locality}
          onChange={handleChange}
        />
        <br /><br />

        <input
          name="experience"
          placeholder="Experience"
          value={form.experience}
          onChange={handleChange}
        />
        <br /><br />

        <input
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
        />
        <br /><br />

        <button type="submit">Register</button>

      </form>

    </div>
  )
}

export default TutorRegister