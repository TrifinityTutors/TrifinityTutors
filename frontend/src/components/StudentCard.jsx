function StudentCard({ data }) {
  return (
    <div className="bg-white shadow-md p-5 rounded-lg border">

      <h2 className="text-xl font-semibold mb-2">
        Class {data.class}
      </h2>

      <p className="text-gray-600">
        Subject: {data.subject}
      </p>

      <p className="text-gray-600">
        Locality: {data.locality}
      </p>

      <p className="text-gray-600 mb-4">
        Time: {data.time}
      </p>

      <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Apply
      </button>

    </div>
  )
}

export default StudentCard