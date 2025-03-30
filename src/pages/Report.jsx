import Route from "../components/Route";
import { useState, useEffect } from "react";
import axios from "axios";
import config from "../config";
import * as XLSX from "xlsx"; // สำหรับการส่งออก Excel
import Swal from "sweetalert2";

function Report() {
  const [reports, setReports] = useState([]);
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalIncome: 0,
    totalExpense: 0,
    profit: 0,
  });

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

  // const fetchReports = async () => {
  //   try {
  //     const res = await axios.get(config.apiPath + "/api/report/sales");
  //     if (res.data.results) {
  //       setReports(res.data.results);

  //       // คำนวณสรุปยอด
  //       const totalSales = res.data.results.reduce((acc, report) => acc + report.total, 0);
  //       const totalIncome = res.data.results.reduce((acc, report) => acc + report.income, 0);
  //       const totalExpense = res.data.results.reduce((acc, report) => acc + report.expense, 0);
  //       const profit = totalIncome - totalExpense;

  //       setSummary({
  //         totalSales,
  //         totalIncome,
  //         totalExpense,
  //         profit,
  //       });
  //     }
  //   } catch (e) {
  //     console.error("Error fetching reports:", e.message);
  //   }
  // };

  // ฟังก์ชันสำหรับส่งออก Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(reports);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");
    XLSX.writeFile(workbook, "Reports.xlsx");
  };

  // ຟັງຊັ່ນໃນການພິມ
  const PrintReport = async () => {
    const items = reports.map((item) => ({
      date_add: item.date_add,
      name: item.user.name,
      tran_type: item.tran_type,
      totalPrice: item.totalPrice,
    }));

    const billHTML = `
          <div>
            <h2 class="text-center">ພິມລາຍງານ</h2>
          ${
            forSearch.month_type == "d" ? (
              `<h4>
                ປະຈຳວັນທີ: 
                ${new Date(forSearch.dmy).toLocaleDateString("en-GB")}
              </h4>`
            )
         :  forSearch.month_type == "m" ? (
          `<h4>
            ປະຈຳເດືອນ: 
            ${new Date(forSearch.dmy).getMonth() + 1 }
          </h4>`
        )
       : (
        `<h4>
          ປະຈຳປີ: 
          ${new Date(forSearch.dmy).getFullYear()}
        </h4>`
      )}
          
            <table>
              <thead>
                <tr>
                  <th class="text-center">ລຳດັບ</th>
                  <th class="text-center">ວັນທີ</th>
                  <th class="text-center">ພະນັກງານຂາຍ</th>
                  <th class="text-center">ຍອດຂາຍ</th>
                  <th class="text-center">ລາຍຮັບ</th>
                  <th class="text-center">ລາຍຈ່າຍ</th>
                </tr>
              </thead>
              <tbody>
                ${items
                  .map(
                    (item, index) => `
                      <tr>
                        <td>${index + 1}</td>
                        <td>${new Date(item.date_add).toLocaleDateString(
                          "en-GB"
                        )}</td>
                        <td>${item.name}</td>
                        <td class="text-end">${
                          item.tran_type == "income"
                            ? item.totalPrice.toLocaleString("th-TH")
                            : "0"
                        }</td>
                        <td class="text-end">${
                          item.tran_type == "income"
                            ? item.totalPrice.toLocaleString("th-TH")
                            : "0"
                        }</td>
                        <td class="text-end">${
                          item.tran_type == "expense"
                            ? item.totalPrice.toLocaleString("th-TH")
                            : "0"
                        }</td>
                      </tr>`
                  )
                  .join("")}
              </tbody>
            </table>


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
  const fetchData = async (data = "") => {
    try {
      const res = await axios.post(
        config.apiPath +
          `/api/transaction/list?sort=${data.sort}&page=${data.page}&perpage=${data.totalPages}`,
        { dmy: forSearch.dmy, month_type: forSearch.month_type },
        config.headers()
      );

      if (res.data.results !== undefined) {
        setReports(res.data.results);

        setSummary({
          totalSales: res.data.total_inc,
          totalIncome: res.data.total_inc,
          totalExpense: res.data.total_exp,
          profit: res.data.total_inc - res.data.total_exp,
        });
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

  return (
    <Route>
      <div className="p-6 h-screen">
        <h1 className="text-3xl font-bold mb-4">ລາຍງານ</h1>

        {/* สรุปยอด */}
        <div className="grid grid-cols-4 gap-4 pb-4">
          <div className="p-4 bg-blue-500 border border-b-blue-600 rounded-lg">
            <h2 className="text-amber-50 font-semibold">ຍອດຂາຍລວມ</h2>
            <p className="text-2xl font-bold text-blue-50 text-end">
              {summary.totalSales
                ? summary.totalSales.toLocaleString("th-TH")
                : 0}{" "}
              ກີບ
            </p>
          </div>
          <div className="p-4 bg-green-700 border border-green-300 rounded-lg">
            <h2 className="text-white font-semibold">ລາຍຮັບລວມ</h2>
            <p className="text-2xl font-bold text-white text-end">
              {summary.totalIncome
                ? summary.totalIncome.toLocaleString("th-TH")
                : 0}{" "}
              ກີບ
            </p>
          </div>
          <div className="p-4 bg-blue-400 border border-red-300 rounded-lg">
            <h2 className="text-white font-semibold">ລາຍຈ່າຍລວມ</h2>
            <p className="text-2xl font-bold text-white text-end">
              {summary.totalExpense
                ? summary.totalExpense.toLocaleString("th-TH")
                : 0}{" "}
              ກີບ
            </p>
          </div>
          <div className="p-4 bg-emerald-700 border border-amber-950 rounded-lg">
            <h2 className="text-white font-semibold">ກຳໄລ</h2>
            <p className="text-2xl font-bold text-white text-end">
              {summary.profit ? summary.profit.toLocaleString("th-TH") : 0} ກີບ
            </p>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="relative pb-4">
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
          {/* ปุ่มส่งออก */}
          <div className="flex pb-4">
            <button
              onClick={exportToExcel}
              className="bg-green-500 text-white px-4 py-2 rounded-lg cursor-pointer mr-2 hover:bg-amber-300"
            >
              ບັນທືກເປັນ Excel
            </button>
            <button
              onClick={PrintReport}
              className="bg-red-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-amber-300"
            >
              ພິມລາຍງານ
            </button>
          </div>
        </div>

        {/* ตารางรายงาน */}
        <div className="h-[55vh] overflow-auto pb-2">
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-center">
                  ລຳດັບ
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  ວັນທີ
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  ພະນັກງານ
                </th>
                <th className="border border-gray-300 px-4 py-2 text-right">
                  ຍອດຂາຍ
                </th>
                <th className="border border-gray-300 px-4 py-2 text-right">
                  ລາຍຮັບ
                </th>
                <th className="border border-gray-300 px-4 py-2 text-right">
                  ລາຍຈ່າຍ
                </th>
              </tr>
            </thead>
            <tbody>
              {reports.length > 0 ? (
                reports.map((report, index) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {index + 1}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {new Date(report.date_add).toLocaleDateString("en-GB")}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {report.user.name}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      {report.tran_type == "income"
                        ? report.totalPrice.toLocaleString("th-TH")
                        : "0"}{" "}
                      ກີບ
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      {report.tran_type == "income"
                        ? report.totalPrice.toLocaleString("th-TH")
                        : "0"}{" "}
                      ກີບ
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      {report.tran_type == "expense"
                        ? report.totalPrice.toLocaleString("th-TH")
                        : "0"}{" "}
                      ກີບ
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="border border-gray-300 px-4 py-2 text-center text-gray-500"
                  >
                    ບໍ່ມີຂໍ້ມູນລາຍງານ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Route>
  );
}

export default Report;
