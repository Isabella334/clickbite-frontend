import { useNavigate } from "react-router-dom"
import { getRestaurants } from "../services/restaurant"
import { useEffect, useState } from "react"

export default function Restaurants() {
  const navigate = useNavigate()
  const [restaurants, setRestaurants] = useState([])

  useEffect(() => {
    getRestaurants().then(setRestaurants)
  }, [])

  return (
    <div>
      <h1>Restaurantes</h1>
      <div>
        {restaurants.map(r => (
          <div key={r._id}>{r.name}</div>
        ))}
      </div>

      <button onClick={() => navigate("/menu")}>
        Ver menú
      </button>
    </div>
  )
}
