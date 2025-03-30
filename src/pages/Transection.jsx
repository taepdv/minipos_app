import { useEffect, useState } from "react";
import Route from "../components/Route";
import Swal from "sweetalert2";
import axios from "axios";
import config from "../config";

function Transection() {
  const [Transections, setTransections] = useState([]); // SHOW
  const [TableObject, setTableObject] = useState({
    sort: "desc",
    search: "",
  }); //

  const [forSearch, setForSearch] = useState({
    dmy: new Date().toISOString().split("T")[0],
    month_type: "d",
  });

  useEffect(() => {
    fetchData(TableObject);
  }, []);

  const fetchData = async (data = "") => {
    try {
      const res = await axios.post(
        config.apiPath +
          `/api/transaction/list?sort=${data.sort}&page=${data.page}&perpage=${data.totalPages}`,
        { dmy: forSearch.dmy, month_type: forSearch.month_type },
        config.headers()
      );

      if (res.data.results !== undefined) {
        setTransections(res.data.results);
        setTableObject({
          sort: res.data.sort,
          search: res.data.search,
          amount: res.data.totalPosts,
        });
        setForSearch({
          ...forSearch,
          dmy: res.data.dmy,
          month_type: res.data.month_type,
        });
        console.log(TableObject.page, TableObject.totalPages);
      }
    } catch (e) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };

  const handleOrderBy = (value) => {
    const sort = value;
    setTableObject((TableObject.sort = sort));
    fetchData(TableObject);
    console.log(TableObject.sort);
  };
  const handleSearchMonthType = (value) => {
    console.log(value);
    setForSearch((forSearch.month_type = value));
    fetchData(TableObject);
  };
  const handleSearchDmy = (e) => {
    const value = e;
    setForSearch((forSearch.dmy = value));
    fetchData(TableObject);
  };

  return (
    <Route>
    
        <div className="px-6 pt-6 pb-10 relative">
          <div className="text-2xl mb-4">ການເຄື່ອນໄຫວທຸລະກຳ</div>{" "}
          <hr className="my-2" />
          <div className="flex justify-between items-center">
            <div>
              {TableObject.sort == "desc" ? (
                <div>
                  <i
                    className="fa-solid fa-arrow-up-wide-short cursor-pointer mr-2"
                    onClick={() => handleOrderBy("asc")}
                  ></i>
                  <span> ຂໍ້ມູນໃໝ່ສຸດກ່ອນ</span>
                </div>
              ) : (
                <div>
                  <i
                    className="fa-solid fa-arrow-up-short-wide cursor-pointer mr-2"
                    onClick={() => handleOrderBy("desc")}
                  ></i>
                  <span> ຂໍ້ມູນເກົ່າສຸດກ່ອນ</span>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                className={`py-2 px-2 cursor-pointer border border-r-0 my-2 rounded-l-md ${
                  forSearch.month_type == "m"
                    ? "bg-gray-800 text-white"
                    : "bg-gray-200 text-black"
                }`}
                onClick={() => handleSearchMonthType("m")}
              >
                ເດືອນ
              </button>
              <button
                className={`py-2 px-4 cursor-pointer border border-r-0 my-2 ${
                  forSearch.month_type == "d"
                    ? "bg-gray-800 text-white"
                    : "bg-gray-200 text-black"
                }`}
                onClick={() => handleSearchMonthType("d")}
              >
                ວັນ
              </button>
              <button
                className={`py-2 px-4 cursor-pointer border my-2 rounded-r-md mr-2 ${
                  forSearch.month_type == "y"
                    ? "bg-gray-800 text-white"
                    : "bg-gray-200 text-black"
                }`}
                onClick={() => handleSearchMonthType("y")}
              >
                ປີ
              </button>
              <input
                type="date"
                value={forSearch.dmy}
                onChange={(e) => handleSearchDmy(e.target.value)}
                className={`py-2 px-4 cursor-pointer border my-2 rounded-md bg-gray-200 text-black`}
              />
            </div>
          </div>
          <div className="h-[70vh] overflow-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-green-700">
                  <th className="border px-4 py-4">ວັນເດືອນປີ</th>
                  <th className="border px-4 py-4">ເນື້ອໃນລາຍການ</th>
                  <th className="border px-4 py-4">ຜູ້ເຮັດທຸລະກຳ</th>
                  <th className="border px-4 py-4">ຮັບ-ຈ່າຍດ້ວຍ</th>
                  <th className="border px-4 py-4">ຈຳນວນເງິນ</th>
                </tr>
              </thead>
              <tbody>
                {Transections.length > 0 ? (
                  Transections.map((item) => (
                    <tr key={item.id} className="bg-green-50 hover:bg-gray-300">
                      <td className="border px-4 py-2 text-center">
                        {item.tran_type == "expense" ? (
                          <i className="fa-solid fa-arrow-left text-red-500 mr-2"></i>
                        ) : (
                          <i className="fa-solid fa-arrow-right text-green-500 mr-2"></i>
                        )}
                        {new Date(item.date_add).toLocaleDateString("en-GB")}
                      </td>
                      <td className="border px-4 py-2">{item.detail}</td>
                      <td className="border px-4 py-2">{item.user.name}</td>
                      <td className="border px-4 py-2 text-center">
                        {item.paymentMethod == "qrcode" ||
                        item.paymentMethod == "cash" ? (
                          item.paymentMethod == "qrcode" ? (
                            <div><i className="fa-solid fa-qrcode text-blue-800 mr-2"></i>  ໂອນຈ່າຍ </div>
                          ) : (
                           <div> <i className="fa-solid fa-wallet text-gray-500 mr-2"></i> ຈ່າຍດ້ວຍເງິນສົດ </div> 
                          )
                        ) : (
                          item.paymentMethod
                        )}
                      </td>
                      <td className="border px-4 py-2 text-end">
                        {" "}
                        {item.totalPrice.toLocaleString("th-TH")} ກີບ
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="border px-4 py-2 text-center">
                      No Transections available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="pt-8 absolute bottom-3">
              <span>ທັງໝົດ </span>
              <span className="text-red-500">{TableObject.amount}</span>{" "}
              <span> ລາຍການ</span>
            </div>
          </div>
        </div>
    </Route>
  );
}

export default Transection;
