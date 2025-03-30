import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Store from "./pages/Store";
import Pos from "./pages/Pos";
import Transection from "./pages/Transection";
import Report from "./pages/Report";

const router = createBrowserRouter([
  {
    path: "/home",
    element: <Home />,
  },
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/store",
    element: <Store />,
  },
  {
    path: "/pos",
    element: <Pos />,
  },
  {
    path: "/transection",
    element: <Transection />,
  },
  {
    path: "/report",
    element: <Report />,
  },
  
]);
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<RouterProvider router={router} />);