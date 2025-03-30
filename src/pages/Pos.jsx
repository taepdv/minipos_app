import Route from "../components/Route";
import { useState, useEffect } from "react";
import axios from "axios";
import config from "../config";
import Swal from "sweetalert2";
import QRCodeGenerator from "qrcode-generator";

export default function POS() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [open, setOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [cash, setCash] = useState(0);
  const [search, setSearch] = useState("")

  // useEffect ຈະເຮັດວຽກເມືອໜ້າເວັບຖືກໂຫລດທຳອິດ
  useEffect(() => {
    fetchData();
  }, [search]);

  // ດຶງຂໍ້ມູນຈາກຖານຂໍ້ມູນມາສະແດງ
  const fetchData = async () => {
    try {
      const res = await axios.get(config.apiPath + `/api/product/list?search=${search}`);
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

  const addToCart = (product) => {
    const existingProduct = cart.find((item) => item.id === product.id);
    if (existingProduct) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...existingProduct, qty: existingProduct.qty + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const removeOneFromCart = (id) => {
    const existingProduct = cart.find((item) => item.id === id);
    if (existingProduct.qty === 1) {
      setCart(cart.filter((item) => item.id !== id));
    } else {
      setCart(
        cart.map((item) =>
          item.id === id
            ? { ...existingProduct, qty: existingProduct.qty - 1 }
            : item
        )
      );
    }
  };
  const removeFromCart = (id) => {
    const existingProduct = cart.find((item) => item.id === id);
    if (existingProduct) {
      setCart(cart.filter((item) => item.id !== id));
    }
  };

  const addOneToCart = (id) => {
    const existingProduct = cart.find((item) => item.id === id);
    if (existingProduct) {
      setCart(
        cart.map((item) =>
          item.id === id
            ? { ...existingProduct, qty: existingProduct.qty + 1 }
            : item
        )
      );
    }
  };

  const total = cart.reduce((acc, item) => {
    return acc + item.price_sell * item.qty;
  }, 0);

  const change = cash ? parseFloat(cash) - total : 0;

  const generateQRCode = (amount) => {
    const qr = QRCodeGenerator(0, "L");
    qr.addData(`pay?amount=${amount}`);
    qr.make();
    return qr.createImgTag(6);
  };

  // ຟັງຊັນສໍາລັບການຊຳລະເງິນ
  const confrimPayment = async () => {
    try {
      const res = await axios.post(config.apiPath + `/api/bill/payment`, {
        cart: cart,
        paymentMethod: paymentMethod,
        total: total,
        cash: paymentMethod === "cash" ? cash : 0,
        user_id: localStorage.getItem("user_id"),
      });
      if (res.data.icon == "success") {


        // ສະແດງບິນ
        const bill_id = res.data.bill_id;
        const bill = await axios.get(
          config.apiPath + `/api/bill/list/${bill_id}`
        );
        const billData = bill.data.results;
        const items = billData.billDetail.map((item) => ({
          name: item.product.name,
          price: item.price,
          qty: item.amount,
          total: item.price * item.amount,
        }));
        const total = billData.totalPrice;
        const cashier = billData.user.name;
        const cash = billData.cash;
        const billHTML = `
          <div>
            <h2 class="text-center">ໃບບິນຮັບເງິນ</h2>
            <h4>ພະນັກງານຂາຍ: ${cashier}</h4>
            <h4>ວັນທີ: ${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}</h4>
            <table>
              <thead>
                <tr>
                  <th class="text-center">ສິນຄ້າ</th>
                  <th class="text-center">ລາຄາ</th>
                  <th class="text-center">ຈຳນວນ</th>
                  <th class="text-center">ລວມ</th>
                </tr>
              </thead>
              <tbody>
                ${items
                  .map(
                    (item) => `
                      <tr>
                        <td>${item.name}</td>
                        <td class="text-end">${item.price.toLocaleString("th-TH")}</td>
                        <td class="text-center">${item.qty}</td>
                        <td class="text-end">${item.total.toLocaleString("th-TH")}</td>
                      </tr>`
                  )
                  .join("")}
              </tbody>
            </table>
            <h4>ລວມ: ${total.toLocaleString("th-TH")} ກີບ</h4>
            <h4> ${cash > 0 ? 'ຈ່າຍເງິນສົດ: ' + cash.toLocaleString("th-TH") + ' ກີບ': 'ໂອນຈ່າຍ'} </h4>
            <h4> ${cash > 0 ? 'ເງິນທອນ: ' + (cash - total).toLocaleString("th-TH") + ' ກີບ' : ''} </h4>
            <p class="text-center"> ຂອບໃຈທີ່ໃຊ້ບໍລິການ </p>

          </div>`;
        const printWindow = window.open("", "_blank");
        printWindow.document.write(`
          <html>
            <head>
              <title>ບິນ</title>
              <style>
                body {
                  font-family: 'phetsarath OT', sans-serif;
                  padding: 20px;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                }
                th, td {
                  border: 1px solid #000;
                  padding: 8px;
                  text-align: left;
                }
                th {
                  background-color: #f2f2f2;
                }
                .text-center{ 
                    text-align: center;
                }
                .text-end{ 
                    text-align: right;
                }

              </style>
            </head>
            <body>${billHTML}</body>
          </html>`);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
        // ສະແດງບິນ

        await Swal.fire({
          title: "ສຳເລັດ",
          text: "ຊຳລະເງິນສໍາເລັດ",
          icon: "success",
        });
        setCash(0);
        setCart([]);
        setOpen(false);
        setPaymentMethod("cash");
      }
    } catch (e) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };

  const handleSearch = async () => {
    fetchData()
  }

  return (
    <Route>
      <div className="p-4">
        <h1 className="text-xl font-bold"> ໜ້າຂາຍສິນຄ້າ</h1>
        <hr className="border border-green-700 w-full my-2" />

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
          <h2 className="text-lg font-semibold my-4 relative">
              <input type="text" className="py-3 px-4 border-2 w-full rounded-full " placeholder="ຄົ້ນຫາສິນຄ້າ....." 
              onChange={(e) => setSearch(e.target.value)}
              />
             <i className="fa-solid fa-magnifying-glass absolute right-8 top-4 text-2xl cursor-pointer hover:text-pink-500" onClick={handleSearch}></i>
            </h2>
            <div className="grid grid-cols-4 gap-4 h-[74vh] overflow-auto">
              {products.length > 0 ? (
                products.map((item) => (
                  <div
                    key={item.id}
                    className="relative shadow-lg rounded-lg p-4 bg-white cursor-pointer hover:shadow-xl hover:shadow-black transition duration-300"
                    onClick={() => addToCart(item)} // ສິນຄ້າທີ່ເພີ່ມໃນລາຍການ
                  >
                    {/* ສະແດງຈຳນວນທີ່ເລືອກ */}
                    {cart.find((cartItem) => cartItem.id === item.id) && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full px-2 py-1 text-xs">
                        {cart.find((cartItem) => cartItem.id === item.id).qty}
                      </div>
                    )}
                    {/* ສະແດງຈຳນວນທີ່ເລືອກ */}
                    <img
                      src={
                        item.image
                          ? item.image
                          : "https://cdn-icons-png.flaticon.com/512/259/259987.png"
                      }
                      alt={item.name}
                      className="w-full h-32 object-cover rounded-lg mb-2"
                    />
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <p className="text-gray-600 text-end">
                      ລາຄາ: {item.price_sell.toLocaleString("th-TH")} ກີບ
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-4 text-center">
                  <p>ບໍ່ມີສິນຄ້າໃນລາຍການ</p>
                </div>
              )}
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">ລາຍການສິນຄ້າ</h2>
            <div className="bg-green-400 rounded-lg p-4 h-[74vh] overflow-auto shadow-2xl text-white">
              <h2 className="text-lg font-semibold mb-2 flex items-center">
                🛒 ລາຍການສັ່ງຊື້
              </h2>
              <div className="p-4 border rounded-lg shadow-md h-[66vh] overflow-auto">
                {cart.length === 0 ? (
                  <p className="text-gray-500">ຍັງບໍ່ມີລາຍການສິນຄ້າ</p>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center pb-2"
                    >
                      <img
                        src={
                          item.image
                            ? item.image
                            : "https://cdn-icons-png.flaticon.com/512/259/259987.png"
                        }
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-lg mr-2 border-2 border-gray-300 shadow-lg"
                      />
                      <span>
                        {item.name} x {item.qty}
                      </span>
                      <span>
                        {(item.price_sell * item.qty).toLocaleString("th-TH")}
                      </span>
                      <i
                        className="fa-solid fa-minus text-amber-500 cursor-pointer"
                        onClick={() => removeOneFromCart(item.id)}
                      ></i>
                      <i
                        className="fa-solid fa-plus text-gray-50 cursor-pointer"
                        onClick={() => addOneToCart(item.id)}
                      ></i>
                      <button
                        className="text-red-600 cursor-pointer"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  ))
                )}
                <hr className="my-2" />
                <div className="flex justify-between font-bold">
                  <span>ລວມ</span>
                  <span>{total.toLocaleString("th-TH")} ກີບ</span>
                </div>
                <button
                  className="mt-4 w-full bg-green-800 text-white py-2 rounded-lg cursor-pointer"
                  disabled={cart.length === 0}
                  onClick={() => setOpen(true)}
                >
                  ຊຳລະເງິນ
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Modal for Payment */}
        {open && (
          <div className="fixed inset-0 bg-green-200 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
              <button
                className="absolute right-2 top-0 text-lg text-red-300 hover:text-red-500 p-2 cursor-pointer"
                onClick={() => setOpen(false)}
              >
                X
              </button>
              <h2 className="text-lg font-bold mb-4">ຊຳລະເງິນ</h2>
              <p className="text-lg font-semibold">
                ລວມຍອດ: {total.toLocaleString("th-TH")} ກີບ
              </p>
              <div className="flex space-x-2 py-4">
                <button
                  className={`py-2 px-4 rounded-lg ${
                    paymentMethod === "cash"
                      ? "bg-blue-600 text-white"
                      : "border"
                  }`}
                  onClick={() => setPaymentMethod("cash")}
                >
                  ເງິນສົດ
                </button>
                <button
                  className={`py-2 px-4 rounded-lg ${
                    paymentMethod === "qrcode"
                      ? "bg-blue-600 text-white"
                      : "border"
                  }`}
                  onClick={() => setPaymentMethod("qrcode")}
                >
                  📷 ສະແກນ QR Code
                </button>
              </div>
              {paymentMethod === "cash" && (
                <>
                  <input
                    type="number"
                    placeholder="ເງິນສົດ"
                    className="w-full p-2 border rounded-md"
                    value={cash}
                    onChange={(e) => setCash(e.target.value)}
                  />
                  {change > 0 && (
                    <p className="text-green-600 font-bold mt-2">
                      ເງິນທອນ: {change.toLocaleString("th-TH")} ກີບ
                    </p>
                  )}
                </>
              )}
              {paymentMethod === "qrcode" && total > 0 && (
                <div
                  className="flex justify-center mt-4"
                  dangerouslySetInnerHTML={{ __html: generateQRCode(total) }}
                />
              )}
              <button
                className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 cursor-pointer"
                disabled={
                  paymentMethod === "cash" && (cash <= 0 || cash < total)
                }
                onClick={() => confrimPayment()}
              >
                ຢືນຢັນການຊຳລະເງິນ
              </button>
            </div>
          </div>
        )}
      </div>
    </Route>
  );
}
