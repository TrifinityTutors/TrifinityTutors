import { useState } from "react"

function TutorRegister(){

  const [form,setForm] = useState({
    name:"",
    subjects:"",
    experience:"",
    locality:""
  })

  const handleChange = (e)=>{
    setForm({...form,[e.target.name]:e.target.value})
  }

  const handleSubmit = (e)=>{
    e.preventDefault()
    console.log(form)
  }

  return(

    <div>

      <h2>Tutor Registration</h2>

      <form onSubmit={handleSubmit}>

        <input
          name="name"
          placeholder="Name"
          onChange={handleChange}
        />

        <br /><br />

        <input
          name="subjects"
          placeholder="Subjects"
          onChange={handleChange}
        />

        <br /><br />

        <input
          name="experience"
          placeholder="Experience"
          onChange={handleChange}
        />

        <br /><br />

        <input
          name="locality"
          placeholder="Locality"
          onChange={handleChange}
        />

        <br /><br />

        <button type="submit">Submit</button>

      </form>

    </div>
  )
}

export default TutorRegister