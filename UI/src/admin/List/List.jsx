import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import GeneralLoader from "../../components/GeneralLoader/GeneralLoader";
import "./List.css";

export const List = ({ url }) => {
  const [list, SetList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [filteredList, setFilteredList] = useState([]); // State for filtered list

  let adminRole = "";
  const token = localStorage.getItem("token");

  if (token) {
    const payload = JSON.parse(atob(token.split(".")[1])); // Decodes the payload part of the JWT
    const adminId = payload.id;
    adminRole = payload.role;
    console.log("adminId", adminId);
    console.log("adminRole", adminRole);
  }

  const fetchList = async () => {
    setLoading(true); // Set loading to true before fetching
    try {
      const response = await axios.get(`${url}/api/food/list`);
      if (response.data.success) {
        SetList(response.data.data);
        setFilteredList(response.data.data); // Set initial filtered list
      } else {
        toast.error("Error");
      }
    } catch (error) {
      toast.error("Error fetching list");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter the list based on search query
    if (query === "") {
      setFilteredList(list); // Show all items if no search query
    } else {
      setFilteredList(
        list.filter((item) =>
          item.name.toLowerCase().includes(query) ||
          (item.subcategory && item.subcategory.name.toLowerCase().includes(query))
        )
      );
    }
  };

  const removeFood = async (foodId) => {
    const response = await axios.delete(`${url}/api/food/remove`, {
      data: { id: foodId },
    });
    await fetchList();
    if (response.data.success) {
      toast.success(response.data.message);
    } else {
      toast.error("Error");
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const isAuthorized = adminRole === "Leader";

  return (
    <div className={`main-contentt ${!isAuthorized ? "blurred" : ""}`}>
      {!isAuthorized && (
        <div className="lock-overlay">
          <i className="lock-icon">🔒</i>
          <p>Access Restricted</p>
        </div>
      )}
      {loading && isAuthorized ? (
        <GeneralLoader message="Getting the food list ready for impact..." />
      ) : (
        isAuthorized && (
          <>
            <div className="list flex-col">
              <div className="search-barr">
              <i className="search-iconn fas fa-search"></i>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder="Search here for Items..."
                />
              </div>

              <div className="list-table">
                <div className="list-table-format title">
                  <b>Image</b>
                  <b>Name</b>
                  <b>Subcategory</b>
                  <b>Price</b>
                </div>
                {filteredList.map((item, index) => {
                  return (
                    <div key={index} className="list-table-format">
                      <img src={`${url}/images/` + item.image} alt="" />
                      <p>{item.name}</p>
                      <p>
                        {item.subcategory ? item.subcategory.name : "No Subcategory"}
                      </p>
                      <p>${item.price}</p>
                      <p onClick={() => removeFood(item._id)} className="cursor">
                        X
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )
      )}
    </div>
  );
};

export default List;