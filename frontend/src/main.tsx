import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom'

import App from './App.tsx'
import Register from './pages/Register.tsx'
import Login from './pages/Login.tsx'
import DashboardPage from './pages/Dashboard/DashboardPage.tsx'
import ProductPage from './pages/ProductPage.tsx'
import MainLayout from './components/MainLayout.tsx'
import SportPage from './pages/SportPage.tsx'
import SportProductsPage from './pages/SportsProductPage.tsx'
import RecommendationsPage from './pages/RecommendationsPage/RecommendationsPage.tsx'
import OrderPage from './pages/OrderPage.tsx'
import ProfilePage from './pages/ProfilePage/ProfilePage.tsx'

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <App />,
      },

      {
        path: "/dashboard",
        element: <DashboardPage />,
      },

      {
        path: "/profile",
        element: <ProfilePage />,
      },
      {
        path: "/products/:productId",
        element: <ProductPage />,
      },
      {
        path: "/sports",
        element: <SportPage />,
      },
      {
        path: "/sports/:sportId/products", 
        element: <SportProductsPage />, 
      }, 
      {
        path: "/recommendations",
        element: <RecommendationsPage />,
      }, 
      { 
        path: "/order", 
        element: <OrderPage />,
      }
    ],
  },

  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)