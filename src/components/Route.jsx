import PropTypes from "prop-types";
import Sidebar from "./Sidebar";
import { useState } from "react";

Route.propTypes = {
  children: PropTypes.node,
};
function Route(props) {
  const [isOpenSidebar, setIsOpenSidebar] = useState(true); // open and close sidebar
  const [isOpenButton, setIsOpenButton] = useState("left-56"); // change width button
  const [isOpenContent, setIsOpenContent] = useState("left-64");

  const handleSidebarMode = async () => {
    if (isOpenSidebar) {
      setIsOpenSidebar(false);
      setIsOpenButton("left-2");
      setIsOpenContent("left-4");
    } else {
      setIsOpenSidebar(true);
      setIsOpenButton("left-56");
      setIsOpenContent("left-64");
    }
  };
  return (
    <div className="bg-gray-100 text-white h-screen relative">
      <button
        className={`absolute ${isOpenButton} top-0 bg-black py-1 px-2 cursor-pointer z-50`}
        onClick={handleSidebarMode}
      >
        <i className="fa-solid fa-bars text-red-50 text-md"></i>
      </button>
      <Sidebar openSidebar={isOpenSidebar} />
      <div className={`md:fixed right-4 top-2 ${isOpenContent} bg-green-200 text-black rounded-lg h-[98%]`}>
        {props.children}
      </div>
    </div>
  );
}
export default Route;
