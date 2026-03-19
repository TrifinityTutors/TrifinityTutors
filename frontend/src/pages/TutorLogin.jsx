import { useState } from "react"

function TutorLogin(){

  const [form,setForm] = useState({
    email:"",
    password:""
  })

  const handleChange = (e)=>{
    setForm({...form,[e.target.name]:e.target.value})
  }

  const handleSubmit = async (e)=>{
    e.preventDefault()

    const res = await fetch("http://localhost:5000/api/tutor-login",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify(form)
    })

    const data = await res.json()

    alert(data.message)

    if(data.message === "Login successful"){
      localStorage.setItem("tutor",JSON.stringify(data.tutor))
      window.location.href="/dashboard"
    }

  }

  return(
    <div>

      <h2>Tutor Login</h2>

      <form onSubmit={handleSubmit}>

        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
        />

        <br/><br/>

        <input
          name="password"
          placeholder="Password"
          type="password"
          onChange={handleChange}
        />

        <br/><br/>

        <button type="submit">Login</button>

      </form>

    </div>
  )
}

export default TutorLogin