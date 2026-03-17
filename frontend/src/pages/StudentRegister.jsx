import { useState } from "react"

function StudentRegister() {

  const [form, setForm] = useState({
    name: "",
    class: "",
    subject: "",
    locality: ""
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log(form)
  }

  return (
    <div>
      <h2>Student Registration</h2>

      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" onChange={handleChange} />
        <br /><br />

        <input name="class" placeholder="Class" onChange={handleChange} />
        <br /><br />

        <input name="subject" placeholder="Subject" onChange={handleChange} />
        <br /><br />

        <input name="locality" placeholder="Locality" onChange={handleChange} />
        <br /><br />

        <button type="submit">Submit</button>
      </form>
    </div>
  )
}

export default StudentRegister