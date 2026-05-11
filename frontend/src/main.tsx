import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'; 
import Register from './pages/Register.tsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom'; 
import Login from './pages/Login.tsx';
import ProfileForm from './pages/ProfileForm.tsx';
import QuestionnairePage from './pages/QuestionnairePage.tsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  { 
    path: "/login",
    element: <Login />,
  }, 
  { 
    path: "/profile",
    element: <ProfileForm />,
  }, 
  { 
    path: "/questionnaire",
    element: <QuestionnairePage />,
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
