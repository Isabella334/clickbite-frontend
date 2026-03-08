import { BrowserRouter, Route, Routes } from "react-router-dom"

import Login from "../pages/Login"
import Menu from "../pages/Menu"
import OrderConfirm from "../pages/OrderConfirm"
import Restaurants from "../pages/Restaurants"
import Review from "../pages/Review"

export default function AppRouter() {

  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="/restaurants" element={<Restaurants />} />

        <Route path="/menu" element={<Menu />} />

        <Route path="/confirm" element={<OrderConfirm />} />

        <Route path="/review" element={<Review />} />

      </Routes>

    </BrowserRouter>
  )
}