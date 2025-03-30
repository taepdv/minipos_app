import PropTypes from "prop-types";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

Sidebar.propTypes = {
  openSidebar: PropTypes.string,
};
function Sidebar({ openSidebar }) {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  // ສ່ວນ active menu
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState(location.pathname);

  const handleMenuClick = (path) => {
    setActiveMenu(path);
    navigate(path);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    } else {
      const user = JSON.parse(atob(token.split(".")[1]));
      setUser(user);
    }
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const button = await Swal.fire({
        title: "ອອກຈາກລະບົບ",
        text: "ຢືນຢັນອອກຈາກລະບົບບໍ່",
        icon: "question",
        showCancelButton: true,
        showConfirmButton: true,
        confirmButtonText: "ຕົກລົງ",
        cancelButtonText: "ຍົກເລີກ",
      });

      if (button.isConfirmed) {
        localStorage.removeItem("token");
        navigate("/");
      }
    } catch (e) {
      Swal.fire({
        title: "ຜິດພາດ",
        text: e.message,
        icon: "error",
      });
    }
  };
  return (
    <>
      {openSidebar ? (
        <div className="bg-gradient-to-b from-green-800 to-green-700 text-white p-6 h-full w-60 z-50">
          <div className="bg-green-950 w-full h-52 rounded-md flex flex-col justify-center items-center">
            <div>
              <i className="fa-solid fa-user text-5xl"></i>
            </div>
            <div>
              <p className="text-2xl py-4">{user.username}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-green-900 text-red-500 px-4 py-2 rounded-md hover:bg-green-800 cursor-pointer"
            >
              <i className="fa-solid fa-right-to-bracket mr-2"></i> ອອກຈາກລະບົບ
            </button>
          </div>
          <div className="p-4">
            <ul>
              <li
                className={`py-2 px-4 cursor-pointer text-lg hover:bg-green-400 font-bold rounded-md ${
                  activeMenu === "/home" ? "bg-green-400" : ""
                }`}
                onClick={() => handleMenuClick("/home")}
              >
                <i className="fa-solid fa-home mr-2"></i> ໜ້າຫຼັກ
              </li>
              <li
                className={`py-2 px-4 cursor-pointer text-lg hover:bg-green-400 font-bold rounded-md ${
                  activeMenu === "/store" ? "bg-green-400" : ""
                }`}
                onClick={() => handleMenuClick("/store")}
              >
                <i className="fa-solid fa-user mr-2"></i> ສະຕ໋ອກ
              </li>
              <li
                className={`py-2 px-4 cursor-pointer text-lg hover:bg-green-400 font-bold rounded-md ${
                  activeMenu === "/pos" ? "bg-green-400" : ""
                }`}
                onClick={() => handleMenuClick("/pos")}
              >
                <i className="fa-solid fa-cart-shopping mr-2"></i> ຂາຍ pos
              </li>
              <li
                className={`py-2 px-4 cursor-pointer text-lg hover:bg-green-400 font-bold rounded-md ${
                  activeMenu === "/transection" ? "bg-green-400" : ""
                }`}
                onClick={() => handleMenuClick("/transection")}
              >
                <i className="fa-solid fa-layer-group mr"></i> ການເຄື່ອນໄຫວ
              </li>
              <li
                className={`py-2 px-4 cursor-pointer text-lg hover:bg-green-400 font-bold rounded-md ${
                  activeMenu === "/report" ? "bg-green-400" : ""
                }`}
                onClick={() => handleMenuClick("/report")}
              >
                <i className="fa-solid fa-file-invoice mr-2"></i> ລາຍງານ
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
export default Sidebar;
