import { useNavigate } from "react-router-dom"

export default function Menu() {

  const navigate = useNavigate()

  return (
    <div>
      <h1>Menú del restaurante</h1>

      <button onClick={() => navigate("/confirm")}>
        Confirmar pedido
      </button>
    </div>
  )
}