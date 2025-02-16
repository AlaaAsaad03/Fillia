import { createContext, useEffect, useState } from 'react';
import axios from 'axios';

// Create a new context to hold and share data across components
export const StoreContext = createContext(null);

    const StoreContextProvider = (props) => {

    const [cartItems, setCartItems] = useState({});
    const url = "http://localhost:4000"; //backend url
    const [token, setToken] = useState("");
    const [food_list,setFoodList]=useState([]);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);

    const addToCart = async (foodId) => {

     
      const token = localStorage.getItem("token"); 
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = payload.id;
      const quantity = cartItems[foodId] ? cartItems[foodId] + 1 : 1;
  
      setCartItems((prev) => ({ ...prev, [foodId]: quantity }));
      if (token) {
        try {
          await axios.post(
            `${url}/api/cart/add`,
            { userId, items: [{ itemId: foodId, quantity: 1 }] },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (error) {
          console.error("Error adding to cart:", error);
        }
      }
    };

    const removeFromCart = async (foodId) => {
    const userId = localStorage.getItem("userId");
    const quantity = cartItems[foodId] - 1;

    setCartItems((prev) => {
      const updatedCart = { ...prev };
      if (quantity > 0) {
        updatedCart[foodId] = quantity;
      } else {
        delete updatedCart[foodId];
      }
      return updatedCart;
    });

    if (token) {
      try {
        await axios.post(
          `${url}/api/cart/remove`,
          { userId, items: [{ itemId: foodId, quantity: 1 }] },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error("Error removing from cart:", error);
      }
    }
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const itemId in cartItems) {
      if (cartItems[itemId] > 0) {
        let itemInfo = food_list.find((product) => product._id === itemId);
        console.log("Item Info:", itemInfo); // Check if itemInfo is undefined
        if (itemInfo) {
          totalAmount += itemInfo.price * cartItems[itemId];
        }
      }
    }
    return totalAmount;
  };
  

  //fetching the food items from the backend
  const fetchFoodList=async()=>{
    const response=await axios.get(url+"/api/food/list");
    setFoodList(response.data.data)
  }

  // const loadCartData=async (token)=>{
  //   const response=await axios.post(url+"/api/cart/get",{},{headers:{token}});
  //   setCartItems(response.data.cartData);
  // }

  const fetchCategories = async () => {
    try {
        const response = await axios.get(url + "/api/category");
        console.log('Fetched Categories:', response.data.data); // Debugging line
        setCategories(response.data.data);
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
};


  const fetchSubcategories = async (categoryId) => {
    try {
        const response = await axios.get(`${url}/api/category/${categoryId}/subcategories`);
        console.log('Fetched Subcategories:', response.data.data); // Debugging line
        return response.data.data; // Return the fetched subcategories
    } catch (error) {
        console.error('Error fetching subcategories:', error); // Debugging line
    }
  };

  const fetchItemsBySubcategory = async (subcategoryId) => {
    try {
        const response = await fetch(`${url}/api/category/subcategories/${subcategoryId}/items`);
        const data = await response.json();
        return data.success ? data.data : [];
    } catch (error) {
        console.error("Error fetching items:", error);
        return [];
    }
};


 
useEffect(()=>{
  //prevent being logged out when refreshing the page and displaying the food items from the backend
   async function loadData(){
    await fetchCategories(); // Fetch categories on load
    await fetchFoodList();
    if(localStorage.getItem("token")){
        setToken(localStorage.getItem("token"));
       }
   }
   loadData();
},[])
 

    const contextValue = {
        food_list, //now it can be accessed anywhere
        cartItems,
        addToCart,
        setCartItems,
        removeFromCart,
        getTotalCartAmount,
        url,
        token,
        setToken,
        categories,
        fetchSubcategories,
        setSubcategories,
        fetchCategories,
        fetchItemsBySubcategory,
        fetchFoodList
    }
  return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    )
}

export default StoreContextProvider;