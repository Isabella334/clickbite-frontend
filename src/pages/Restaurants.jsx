import { useNavigate } from "react-router-dom"

export default function Restaurants() {

  const navigate = useNavigate()

  return (
    <div>
      <h1>Restaurantes</h1>

      <button onClick={() => navigate("/menu")}>
        Ver menú
      </button>
    </div>
  )
}