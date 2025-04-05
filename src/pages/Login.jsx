import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import config from "../config";
function Login() {
  const navigate = useNavigate();
  const [typePass, setTypePass] = useState("password");
  const [user, setUser] = useState({});

useEffect(() => {
  const token = localStorage.getItem("token");
  if (token) {
    navigate("/home");
  }
}, [navigate]);

  //ການອັບໂຫລດຂໍ້ມູນໄປຫາ  server
  const handleSave = async () => {
    try {
      if (user.username === undefined || user.password === undefined) {
        Swal.fire({
          title: "ຜິດພາດ!",
          text: "ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບ!",
          icon: "error",
        });
        return;
      }

      const res = await axios.post(`${config.apiPath}/api/user/login`, {
        username: user.username,
        password: user.password,
      });
      if (res.data.token) {
        await Swal.fire({
          title: "ເຂົ້າສູ່ລະບົບ!!",
          text: res.data.message,
          icon: res.data.icon,
        });
        await localStorage.setItem("token", res.data.token);
        await localStorage.setItem("user_id", JSON.stringify(res.data.user_id));
        navigate("/home");
      } else {
        Swal.fire({
          title: "ຜິດພາດ!",
          text: res.data.message,
          icon: res.data.icon,
        });
        return
      }
    } catch (e) {
      Swal.fire({
        title: "ຜິດພາດ!",
        text: e.message,
        icon: "error",
      });
    }
  };

  return (
    <>
      <div className="bg-gray-300 h-screen w-screen flex justify-center items-center">
        <div className="bg-white p-96 w-1/2 rounded-lg">
          <div className="text-center">
            <span className="text-2xl"> ເຂົ້າສູ່ລະບົບ</span>
          </div>

          <div>
            <div> ຊື່ຜູ້ໃຊ້ </div>
            <input
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
              type="text"
              placeholder="ປ້ອນຊື່ຜູ້ໃຊ້......."
              className="bg-transparent rounded-md py-3 px-4 border
                             border-red-500 focus:outline-none w-full mt-2 mb-4"
            />
          </div>

          <div>
            <div> ລະຫັດຜ່ານ </div>
            <div className="relative">
              <input
                value={user.password}
                onChange={(e) => setUser({ ...user, password: e.target.value })}
                type={typePass}
                placeholder="ປ້ອນລະຫັດຜ່ານ......."
                className="bg-transparent rounded-md py-3 px-4 border
                         border-red-500 focus:outline-none w-full mt-2 mb-4"
              />
              {typePass == "text" ? (
                <i
                  className="fa-regular fa-eye-slash absolute right-4 top-6 text-xl cursor-pointer"
                  onClick={() => setTypePass("password")}
                ></i>
              ) : (
                <i
                  className="fa-regular fa-eye absolute right-4 top-6 text-xl cursor-pointer"
                  onClick={() => setTypePass("text")}
                ></i>
              )}
            </div>
          </div>

          <div>
            <button
              className="bg-black text-white p-3 w-full
                rounded-md mt-4 text-xl cursor-pointer mb-4"
              onClick={handleSave}
            >
              ເຂົ້າສູ່ລະບົບ{" "}
            </button>
          </div>
          <div className="text-center">
            <span> ຖ້າຫາກຍັງບໍ່ມີບັນຊີເຂົ້າໃຊ້ ? </span>
            <Link
              to={"/register"}
              className="text-orange-500 hover:text-orange-300"
            >
              ລົງທະບຽນ
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
export default Login;
