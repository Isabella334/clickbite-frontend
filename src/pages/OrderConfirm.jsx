import { useNavigate } from "react-router-dom"

export default function OrderConfirm() {

  const navigate = useNavigate()

  return (
    <div>
      <h1>Confirmar pedido</h1>

      <button onClick={() => navigate("/review")}>
        Dejar reseña
      </button>
    </div>
  )
}