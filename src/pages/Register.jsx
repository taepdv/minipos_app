import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import config from "../config";
function Register() {
  const navigate = useNavigate();
  const [typePass, setTypePass] = useState("password");
  const [typePassCon, setTypePassCon] = useState("password");
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
      if (
        user.name === undefined ||
        user.username === undefined ||
        user.password === undefined
      ) {
        Swal.fire({
          title: "ຜິດພາດ!",
          text: "ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບ!",
          icon: "error",
        });
        return;
      }
      if (user.password != user.conPassword) {
        Swal.fire({
          title: "ຜິດພາດ!",
          text: "ລະຫັດຜ່ານ ແລະ ລະຫັດຢືນຢັນບໍ່ກົງກັນ",
          icon: "error",
        });
        return;
      }
      const res = await axios.post(`${config.apiPath}/api/user/create`, {
        name: user.name,
        username: user.username,
        password: user.password,
      });
      if (res.data.icon == "success") {
        await Swal.fire({
          title: "ລົງທະບຽນ!!",
          text: res.data.message,
          icon: res.data.icon,
        });
        navigate("/");
      } else {
        Swal.fire({
          title: "ຜິດພາດ!",
          text: res.data.message,
          icon: res.data.icon,
        });
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
        <div className="bg-white p-10 w-1/2 rounded-lg">
          <div className="text-center">
            <span className="text-2xl"> ລົງທະບຽນ</span>
          </div>

          <div>
            <div> ຊື່ ແລະ ນາມສະກຸນ</div>
            <input
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
              type="text"
              placeholder="ປ້ອນຊື່ ແລະ ນາມສະກຸນ......"
              className="bg-tranparent rounded-md py-3 px-4 border
                                 border-red-500 focus:outline-none w-full mt-2 mb-4"
            />
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
            <div> ຢືນຢັນລະຫັດຜ່ານ </div>
            <div className="relative">
              <input
                value={user.conPassword}
                onChange={(e) =>
                  setUser({ ...user, conPassword: e.target.value })
                }
                type={typePassCon}
                placeholder="ປ້ອນລະຫັດຢືນຢັນ......."
                className="bg-transparent rounded-md py-3 px-4 border
                             border-red-500 focus:outline-none w-full mt-2 mb-4"
              />
              {typePassCon == "text" ? (
                <i
                  className="fa-regular fa-eye-slash absolute right-4 top-6 text-xl cursor-pointer"
                  onClick={() => setTypePassCon("password")}
                ></i>
              ) : (
                <i
                  className="fa-regular fa-eye absolute right-4 top-6 text-xl cursor-pointer"
                  onClick={() => setTypePassCon("text")}
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
              ລົງທະບຽນ{" "}
            </button>
          </div>
          <div className="text-center">
            <span> ຖ້າຫາກມີບັນຊີເຂົ້າໃຊ້ແລ້ວ ? </span>
            <Link to={"/"} className="text-orange-500 hover:text-orange-300">
              ເຂົ້າສູ່ລະບົບ
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
export default Register;
