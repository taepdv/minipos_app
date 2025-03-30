import Swal from "sweetalert2";
import Route from "../components/Route";
import { useState, useEffect } from "react";
import axios from "axios";
import config from "./../config";

function Store() {
  const [showForm, setShowForm] = useState(false);
  // ການປະກາດຕົວແປສຳຫລັບເກັບຄ່າຈາກຟອມ
  const [Product, setProduct] = useState({
    id: undefined,
    name: "",
    amount: "",
    unit: "",
    price_buy: "",
    price_sell: "",
  });
  // ສ້າງໂຕແປເພື່ອເກັບຂໍ້ມູນຂອງສິນຄ້າ
  const [products, setProducts] = useState([]);
  // ສ່ວນຕົວແປຮູບພາບ
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("https://cdn-icons-png.flaticon.com/512/259/259987.png");
  const [loading, setLoading] = useState(false);

  // useEffect ຈະເຮັດວຽກເມືອໜ້າເວັບຖືກໂຫລດທຳອິດ
  useEffect(() => {
    fetchData();
  }, []);

  // ການບັນທຶກ ແລະ ແກ້ໄຂ
  const handleSave = async () => {
    try {
    const url =  await handleUpload();
      if (
        Product.name == "" ||
        Product.amount == "" ||
        Product.unit == "" ||
        Product.price_buy == "" ||
        Product.price_sell == ""
      ) {
        Swal.fire({
          title: "ຜິດພາດ!!",
          text: "ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບ",
          icon: "warning",
          confirmButtonText: "ຕົກລົງ",
        });
        return;
      }
      let res;

      if (Product.id == undefined) {
        res = await axios.post(config.apiPath + `/api/product/create`, {
          name: Product.name,
          amount: Product.amount,
          unit: Product.unit,
          price_buy: Product.price_buy,
          price_sell: Product.price_sell,
          image: url,
          user_id: localStorage.getItem("user_id"),
        });
      } else {
        res = await axios.put(
          config.apiPath + `/api/product/update/${Product.id}`,
          {
            name: Product.name,
            amount: Product.amount,
            unit: Product.unit,
            price_buy: Product.price_buy,
            price_sell: Product.price_sell,
            image: url,
            user_id: localStorage.getItem("user_id"),
          }
        );
      }
      if (res.data.icon == "success") {
        Swal.fire({
          title: "ສຳເລັດ",
          text: res.data.message,
          icon: "success",
        });
        // ໃຫ້ດຶງຂໍ້ມູນສິນຄ້າມາໃໝ່
        fetchData();
        setProduct({
          id: undefined,
          name: "",
          amount: "",
          unit: "",
          price_buy: "",
          price_sell: "",
        });
        // ໃຫ້ຮູບພາບມີຄ່າວ່າງ
        setImage(null)
        setPreview("https://cdn-icons-png.flaticon.com/512/259/259987.png")
        // ໃຫ້ຟອມປິດໄປ
        setShowForm(false);
      } else {
        Swal.fire({
          title: "ຜິດພາດ",
          text: res.data.message,
          icon: "warning",
        });
        return;
      }
    } catch (e) {
      Swal.fire({
        title: "ຜິດພາດ",
        text: e.message,
        icon: "error",
      });
    }
  };

  // ດຶງຂໍ້ມູນຈາກຖານຂໍ້ມູນມາສະແດງ
  const fetchData = async () => {
    try {
      const res = await axios.get(config.apiPath + `/api/product/list`);
      if (res.data.results) {
        setProducts(res.data.results);
      }
    } catch (e) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };
  // ສ່ວນການແກ້ໄຂ
  const handleEdit = (item) => {
    setProduct({
      id: item.id,
      name: item.name,
      amount: item.amount,
      unit: item.unit,
      price_buy: item.price_buy,
      price_sell: item.price_sell,
    });
    setPreview(item.image ? item.image : "https://cdn-icons-png.flaticon.com/512/259/259987.png")
    setShowForm(true);
  };
  // ຟັງຊັ່ນໃນການລືບ
  const handleDelete = async (item) => {
    try {
      const button = await Swal.fire({
        title: "ຢືນຢັນການລືບ",
        text: "ທ່ານຕ້ອງການລືບສິນຄ້ານີ້ແທ້ ຫລື ບໍ່!!",
        icon: "question",
        showCancelButton: true,
        showConfirmButton: true,
        confirmButtonText: "ຕົກລົງ",
        cancelButtonText: "ຍົກເລີກ",
      });
      if (button.isConfirmed) {
        const res = await axios.delete(
          config.apiPath + `/api/product/delete/${item.id}`
        );
        if (res.data.icon == "success") {
          Swal.fire({
            title: "ລືບສິນຄ້າ",
            text: res.data.message,
            icon: "success",
          });
        }
        fetchData();
        setProduct({
          id: undefined,
          name: "",
          amount: "",
          unit: "",
          price_buy: "",
          price_sell: "",
        });
      }
    } catch (e) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };
  // ການເລືອກຮູບຈາກເຄື່ອງ
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };
  // ການອັບໂຫລດຮູບໄປຍັງ cloudinary
  const handleUpload = async () => {
    if (!image) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", "image_upload"); // ใส่ชื่อ Upload Preset

    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dcfmerbsw/image/upload",
        formData
      );
      return res.data.secure_url;

    } catch (error) {
      console.error("Upload failed:", error);
      alert("เกิดข้อผิดพลาดในการอัปโหลด");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Route>
      <div className="p-4">
        <div className="text-3xl"> hello Store</div>
        <hr className="border border-green-700 w-full my-2" />

        {/* ປຸ່ມ */}
        <div className="text-end">
          {showForm ? (
            <>
              <button
                className="py-2 px-4 bg-blue-500 text-white cursor-pointer rounded-md my-4 mr-2"
                onClick={handleSave}
              >
                {" "}
                <i className="fa-solid fa-check mr-2"></i> ບັນທຶກ
              </button>
              <button
                className="py-2 px-4 bg-yellow-500 text-white cursor-pointer rounded-md my-4"
                onClick={() => setShowForm(false)}
              >
                {" "}
                <i className="fa-solid fa-circle-xmark mr-2"></i> ຍົກເລີກ
              </button>
            </>
          ) : (
            <button
              className="py-2 px-4 bg-stone-500 text-white cursor-pointer rounded-md mr-2 my-4"
              onClick={() => setShowForm(true)}
            >
              {" "}
              <i className="fa-solid fa-circle-plus mr-2"></i> ເພີ່ມ
            </button>
          )}
        </div>
        {/* ປຸ່ມ */}

        {/* ຟອມ */}
        {showForm && (
          <div className="bg-gray-300 p-4 rounded-lg shadow-lg shadow-gray-500">
            <div className="grid grid-cols-3 gap-4">
              {/* ຮູບ */}
              <div>
                <div className="flex flex-col items-center p-4 bg-gray-100 rounded-lg shadow-md">
                  <label className="w-full flex flex-col items-center px-4 py-6 bg-white text-blue-500 rounded-lg shadow-lg tracking-wide uppercase border border-blue-500 cursor-pointer hover:bg-blue-500 hover:text-white transition">
                    <svg
                      className="w-8 h-8"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 10.707a1 1 0 01-1.414 0L11 6.414V15a1 1 0 11-2 0V6.414L4.707 10.707a1 1 0 01-1.414-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 010 1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="mt-2 text-base leading-normal">
                      ເລືອກໄຟລ໌
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                  </label>

                  {preview && (
                    <img
                      src={preview}
                      alt="Preview"
                      className="mt-4 w-48 h-48 object-cover rounded-lg shadow-md"
                    />
                  )}

                  {loading && (
                    <button
                      className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition disabled:bg-gray-400"
                      disabled={loading}
                    >
                      {loading ? "ກຳລັງອັບໂຫລດ..." : "ອັບໂຫລດ"}
                    </button>
                  )}
                </div>
              </div>
              {/* ຮູບ */}
              <div className="col-span-2">
                <div className="grid grid-cols-2 gap-4 py-2">
                  <div className="col-span-2">
                    <label>ຊື່ສິນຄ້າ</label>
                    <input
                      value={Product.name}
                      onChange={(e) =>
                        setProduct({ ...Product, name: e.target.value })
                      }
                      type="text"
                      className="w-full p-3 border border-green-700 rounded-md"
                      placeholder="ປ້ອນຊື່ສິນຄ້າ......."
                    />
                  </div>
                  <div>
                    <label>ຈຳນວນ</label>
                    <input
                      value={Product.amount}
                      onChange={(e) =>
                        setProduct({ ...Product, amount: e.target.value })
                      }
                      type="number"
                      className="w-full p-3 border border-green-700 rounded-md"
                      placeholder="ປ້ອນຈຳນວນ......."
                    />
                  </div>
                  <div>
                    <label>ຫົວໜ່ວຍ</label>
                    <input
                      value={Product.unit}
                      onChange={(e) =>
                        setProduct({ ...Product, unit: e.target.value })
                      }
                      type="text"
                      className="w-full p-3 border border-green-700 rounded-md"
                      placeholder="ປ້ອນຫົວໜ່ວຍ......."
                    />
                  </div>
                  <div>
                    <label>ລາຄາຊື້</label>
                    <input
                      value={Product.price_buy}
                      onChange={(e) =>
                        setProduct({ ...Product, price_buy: e.target.value })
                      }
                      type="number"
                      className="w-full p-3 border border-green-700 rounded-md"
                      placeholder="ປ້ອນລາຄາຊື້......."
                    />
                  </div>
                  <div>
                    <label>ລາຄາຂາຍ</label>
                    <input
                      value={Product.price_sell}
                      onChange={(e) =>
                        setProduct({ ...Product, price_sell: e.target.value })
                      }
                      type="number"
                      className="w-full p-3 border border-green-700 rounded-md"
                      placeholder="ປ້ອນລາຄາຂາຍ......."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* ຟອມ */}

        {/* ຕາຕະລາງ */}
        {!showForm && (
          <div className="h-[70vh] overflow-auto">
            <table className="w-full border-4 border-green-700">
              <thead>
                <tr className="bg-green-700 text-white border border-white">
                  <th className="py-2 px-4 border border-white">ຮູບພາບ</th>
                  <th className="py-2 px-4 border border-white">ຊື່ສິນຄ້າ</th>
                  <th className="py-2 px-4 border border-white">ຈຳນວນ</th>
                  <th className="py-2 px-4 border border-white">ຫົວໜ່ວຍ</th>
                  <th className="py-2 px-4 border border-white">ລາຄາຊື້</th>
                  <th className="py-2 px-4 border border-white">ລາຄາຂາຍ</th>
                  <th className="py-2 px-4 border border-white">ຈັດການ</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((item) => (
                    <tr key={item.id} className="border border-green-700">
                      <td className="py-2 px-4 border border-green-700 text-center">
                        { item.image ? <img src={item.image} className="h-20 w-20" /> : <img src="https://cdn-icons-png.flaticon.com/512/259/259987.png" className="h-20 w-20" /> }
                      </td>
                      <td className="py-2 px-4 border border-green-700">
                        {item.name}
                      </td>
                      <td className="py-2 px-4 border border-green-700 text-center">
                        {item.amount}
                      </td>
                      <td className="py-2 px-4 border border-green-700 text-center">
                        {item.unit}
                      </td>
                      <td className="py-2 px-4 border border-green-700 text-end">
                        {item.price_buy.toLocaleString("th-TH")} ກີບ
                      </td>
                      <td className="py-2 px-4 border border-green-700 text-end">
                        {item.price_sell.toLocaleString("th-TH")} ກີບ
                      </td>
                      <td className="py-2 px-4 border border-green-700 text-center">
                        <button
                          className="py-1 px-2 bg-green-500 text-white cursor-pointer rounded-md mr-2"
                          onClick={() => handleEdit(item)}
                        >
                          {" "}
                          <i className="fa-solid fa-pen mr-2"></i> ແກ້ໄຂ
                        </button>
                        <button
                          className="py-1 px-2 bg-red-500 text-white cursor-pointer rounded-md"
                          onClick={() => handleDelete(item)}
                        >
                          {" "}
                          <i className="fa-solid fa-trash mr-2"></i> ລືບ
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="text-center">
                    <td colSpan={7} className="p-4">
                      ຍັງບໍ່ມິີຂໍ້ມູນສິນຄ້າ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {/* ຕາຕະລາງ */}
      </div>
    </Route>
  );
}
export default Store;
