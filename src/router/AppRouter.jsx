import { BrowserRouter, Route, Routes } from "react-router-dom"

import Admin from "../pages/AdminDashboard"
import Login from "../pages/Login"
import Menu from "../pages/Menu"
import OrderConfirm from "../pages/OrderConfirm"
import History from "../pages/OrderHistory"
import RestaurantDashboard from "../pages/RestaurantDashboard"
import RestaurantOrders from "../pages/RestaurantOrders"
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

        <Route path="/order-history" element={<History />} />

        <Route path="/restaurant-dashboard" element={<RestaurantDashboard />} />

        <Route path="/restaurant-orders" element={<RestaurantOrders />} />

        <Route path="/admin" element={<Admin />} />

      </Routes>

    </BrowserRouter>
  )
}