import axios from "axios";
import { useEffect, useState } from "react";
import config from "../config";
import PropTypes from "prop-types";

Receipt.propTypes = {
  bill_id: PropTypes.string.isRequired,
};

function Receipt({ bill_id }) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [cashier, setCashier] = useState("John Doe");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data from an API
    const fetchData = async () => {
      try {
        const response = await axios(
          config.apiPath + `/api/receipt/${bill_id}`
        );
        const data = await response.json();
        setItems(data.items);
        setTotal(data.total);
        setCashier(data.cashier);
      } catch (error) {
        console.error("Error fetching receipt data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="receipt">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <h2>Receipt</h2>
          <p>Cashier: {cashier}</p>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>${item.price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3>Total: ${total.toFixed(2)}</h3>
        </div>
      )}
    </div>
  );
}

export default Receipt;
