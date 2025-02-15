import React, { useState, useEffect } from "react";
import "./Add.css";
import axios from "axios";
import { toast } from "react-toastify";
import GeneralLoader from "../../components/GeneralLoader/GeneralLoader";

const Add = ({ url }) => {
  const [image, setImage] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [isSubcategoriesLoading, setIsSubcategoriesLoading] = useState(true);
  const isLoading = isCategoriesLoading || isSubcategoriesLoading;

  useEffect(() => {
    fetchCategoriesAndSubcategories(); // Fetch both categories and subcategories simultaneously
  }, []);
  const [categoryData, setCategoryData] = useState({
    _id: "",
    name: "",
    image: null,
  });
  const [subCategoryData, setSubCategoryData] = useState({
    _id: "",
    name: "",
    category: "",
    image: null,
  });
  const [itemData, setItemData] = useState({
    name: "",
    description: "",
    price: "",
    subcategory: "",
    image: null,
  });

  let adminRole = "";
  const token = localStorage.getItem("token");
  
  if(token){
  const payload = JSON.parse(atob(token.split(".")[1])); // Decodes the payload part of the JWT
  const adminId = payload.id;
   adminRole = payload.role;
  console.log("adminId", adminId)
  console.log("adminRole", adminRole)
}

  // Fetch categories and subcategories on component load
  useEffect(() => {
    fetchCategories(); // Fetch all categories
    fetchSubcategories(); // Fetch all subcategories
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${url}/api/category`);
      setCategories(response.data.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch categories");
    }
  };

  const fetchSubcategories = async () => {
    try {
      const response = await axios.get(`${url}/api/category/subcategories`);
      setSubcategories(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch subcategories");
    }
  };
  const fetchCategoriesAndSubcategories = async () => {
    try {
      setIsCategoriesLoading(true);
      setIsSubcategoriesLoading(true);
  
      // Fetch both categories and subcategories simultaneously
      const [categoryResponse, subcategoryResponse] = await Promise.all([
        axios.get(`${url}/api/category`),
        axios.get(`${url}/api/subcategory`),
      ]);
  
      // Update categories and subcategories state
      setCategories(categoryResponse.data);
      setSubcategories(subcategoryResponse.data);
      
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      // Set both loading states to false when the data is fetched
      setIsCategoriesLoading(false);
      setIsSubcategoriesLoading(false);
    }
  };
  
  // Handlers for adding categories
  const handleCategorySubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("name", categoryData.name);
    formData.append("image", categoryData.image);

    try {
      if (categoryData._id) {
        // Edit Category
        const response = await axios.put(
          `${url}/api/category/${categoryData._id}`,
          formData
        );
        if (response.data.success) {
          toast.success("Category updated successfully");
        } else {
          toast.error(response.data.message);
        }
      } else {
        // Add Category
        const response = await axios.post(`${url}/api/category/add`, formData);
        if (response.data.success) {
          toast.success("Category added successfully");
        } else {
          toast.error(response.data.message);
        }
      }
      setCategoryData({ _id: "", name: "", image: null });
      fetchCategories();
    } catch (error) {
      console.error(error);
      toast.error("Failed to process category");
    }
  };

  const handleEditCategory = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("name", categoryData.name);
    if (categoryData.image) {
      formData.append("image", categoryData.image);
    }

    try {
      const response = await axios.put(
        `${url}/api/category/${categoryData._id}`,
        formData
      );
      if (response.data.success) {
        toast.success("Category updated successfully");
        setCategoryData({ _id: "", name: "", image: null });
        fetchCategories();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update category");
    }
  };

  const handleEditSubCategory = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("name", subCategoryData.name);
    formData.append("categoryId", subCategoryData.category);
    if (subCategoryData.image) {
      formData.append("image", subCategoryData.image);
    }

    try {
      const response = await axios.put(
        `${url}/api/category/subcategories/${subCategoryData._id}`,
        formData
      );
      if (response.data.success) {
        toast.success("Subcategory updated successfully");
        setSubCategoryData({ _id: "", name: "", category: "", image: null });
        fetchSubcategories();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update subcategory");
    }
  };

  const handleEditCategoryClick = (category) => {
    setCategoryData({ _id: category._id, name: category.name, image: null });
  };

  const handleEditSubCategoryClick = (subcategory) => {
    setSubCategoryData({
      _id: subcategory._id,
      name: subcategory.name,
      category: subcategory.category?._id,
      image: null,
    });
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      const response = await axios.delete(`${url}/api/category/${categoryId}`);
      if (response.data.success) {
        toast.success("Category deleted successfully");
        fetchCategories();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete category");
    }
  };

  // Handlers for adding subcategories
  const handleSubCategorySubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("name", subCategoryData.name);
    formData.append("categoryId", subCategoryData.category);
    if (subCategoryData.image) {
      formData.append("image", subCategoryData.image);
    }

    try {
      if (subCategoryData._id) {
        // Edit Subcategory
        const response = await axios.put(
          `${url}/api/category/subcategories/${subCategoryData._id}`,
          formData
        );
        if (response.data.success) {
          toast.success("Subcategory updated successfully");
        } else {
          toast.error(response.data.message);
        }
      } else {
        // Add Subcategory
        const response = await axios.post(
          `${url}/api/category/addSub`,
          formData
        );
        if (response.data.success) {
          toast.success("Subcategory added successfully");
        } else {
          toast.error(response.data.message);
        }
      }
      setSubCategoryData({ _id: "", name: "", category: "", image: null });
      fetchSubcategories();
    } catch (error) {
      console.error(error);
      toast.error("Failed to process subcategory");
    }
  };

  const handleDeleteSubCategory = async (subCategoryId) => {
    try {
      const response = await axios.delete(
        `${url}/api/category/subcategories/${subCategoryId}`
      );
      if (response.data.success) {
        toast.success("Subcategory deleted successfully");
        fetchSubcategories(subCategoryData.category);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete subcategory");
    }
  };

  // Handlers for adding items
  const handleItemSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("name", itemData.name);
    formData.append("description", itemData.description);
    formData.append("price", itemData.price);
    formData.append("subcategoryId", itemData.subcategory);
    formData.append("image", itemData.image);

    try {
      const response = await axios.post(`${url}/api/food/add`, formData);
      if (response.data.success) {
        toast.success("Item added successfully");
        setItemData({
          name: "",
          description: "",
          price: "",
          subcategory: "",
          image: null,
        });
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error details:", error.response.data);
      toast.error("Failed to add item");
    }
  };

  const isAuthorized = adminRole === "Leader";

  return (
    <div className={`main-contentt ${!isAuthorized ? "blurred" : ""}`}>
       {!isAuthorized && (
        <div className="lock-overlay">
          <i className="lock-icon">🔒</i>
          <p>Access Restricted</p>
        </div>
      )}
      {isAuthorized && (
        <>
      <div className="add">
        {/* Categories Table */}
        <section className="categoriess">
          <h2>Manage Categories</h2>
          <form onSubmit={handleCategorySubmit} className="add-category-form">
            <input
              type="text"
              className="custom-input"
              placeholder="Category Name"
              value={categoryData.name}
              onChange={(e) =>
                setCategoryData({ ...categoryData, name: e.target.value })
              }
            />
            <div className="file-input">
              <div className="file-upload-wrapper">
                <label htmlFor="file-input" className="custom-file-upload">
                  {categoryData.image ? (
                    <div className="file-preview">
                      <img
                        src={URL.createObjectURL(categoryData.image)}
                        alt="Preview"
                      />
                      <span>Change Image</span>
                    </div>
                  ) : (
                    <span>Drag & Drop or Click to Upload</span>
                  )}
                  <input
                    id="file-input"
                    type="file"
                    onChange={(e) =>
                      setCategoryData({
                        ...categoryData,
                        image: e.target.files[0],
                      })
                    }
                    hidden
                  />
                </label>
              </div>
            </div>
            <button className="btns" type="submit">
              Add Category
            </button>
          </form>
          {isLoading ? (
        <GeneralLoader  message="Fetching Categories..."/> // Show loader while data is being fetched
      ) : (
        <div className="table-container">
          <table  className="category-table">
           <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat._id}>
                  <td>
                    <img src={`http://localhost:4000/uploads/${cat.image}`} />
                  </td>
                  <td>{cat.name}</td>
                  <td>
                    <div className="button-containerrr">
                      <button className="btn" onClick={() => handleEditCategoryClick(cat)}>
                        Edit
                      </button>
                      <button className="btn" onClick={() => handleDeleteCategory(cat._id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody> 
          </table>
          </div>
          )}
        </section>

        {/* Subcategories Table */}
        <section>
          <h2>Manage Subcategories</h2>
          <form
            onSubmit={handleSubCategorySubmit}
            className="add-subcategory-form"
          >
            <input
              type="text"
              placeholder="Subcategory Name"
              value={subCategoryData.name}
               className="custom-input"
              onChange={(e) =>
                setSubCategoryData({ ...subCategoryData, name: e.target.value })
              }
              required
            />
            <select
              className="custom-select" 
              value={subCategoryData.category}
              onChange={(e) =>
                setSubCategoryData({
                  ...subCategoryData,
                  category: e.target.value,
                })
              }
              required
            >
              <option value="" disabled>
                Select Category
              </option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <div className="file-upload-wrapper">
              <div className="file-upload-wrapper">
                <label
                  htmlFor="subcategory-file-input"
                  className="custom-file-upload"
                >
                  {subCategoryData.image ? (
                    <div className="file-preview">
                      <img
                        src={URL.createObjectURL(subCategoryData.image)}
                        alt="Preview"
                      />
                      <span>Change Image</span>
                    </div>
                  ) : (
                    <span>Drag & Drop or Click to Upload</span>
                  )}
                  <input
                    id="subcategory-file-input"
                    type="file"
                    onChange={(e) =>
                      setSubCategoryData({
                        ...subCategoryData,
                        image: e.target.files[0],
                      })
                    }
                    hidden
                  />
                </label>
              </div>
            </div>

            <button className="btns" type="submit">
              Add Subcategory
            </button>
          </form>
          {isLoading ? (
          <GeneralLoader  message="Fetching SubCategories..."/> // Show loader while data is being fetched
        ) : (
          <div className="table-container">
          <table  className="subcategory-table">
           <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subcategories.map((subcat) => (
                <tr key={subcat._id}>
                  <td>
                    <img
                      src={`http://localhost:4000/uploads/${subcat.image}`}
                    />
                  </td>
                  <td>{subcat.name}</td>
                  <td>{subcat.category?.name || "No Category"}</td>
                  <td>
                    <div className="button-containerrr">
                      <button
                       className="btn" onClick={() => handleEditSubCategoryClick(subcat)}
                      >
                        Edit
                      </button>
                      <button className="btn"
                        onClick={() => handleDeleteSubCategory(subcat._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody> 
          </table>
          </div>
        )}
        </section>
          {/* Add Item Section */}
      <section>
        <h2>Add Item</h2>
        <form onSubmit={handleItemSubmit}>
          <input
            type="text"
            placeholder="Item Name"
            className="custom-input"
            value={itemData.name}
            onChange={(e) => setItemData({ ...itemData, name: e.target.value })}
            required
          />
          <textarea
            placeholder="Item Description"
            value={itemData.description}
            className="custom-input"
            onChange={(e) =>
              setItemData({ ...itemData, description: e.target.value })
            }
            required
          ></textarea>
          <input
            type="number"
            placeholder="Item Price"
            className="custom-input"
            value={itemData.price}
            onChange={(e) =>
              setItemData({ ...itemData, price: e.target.value })
            }
            required
          />
          <select
            value={itemData.subcategory}
            className="custom-select"

            onChange={(e) =>
              setItemData({ ...itemData, subcategory: e.target.value })
            }
            required
          >
            <option value="" disabled>
              Select Subcategory
            </option>
            {subcategories.map((subcat) => (
              <option key={subcat._id} value={subcat._id}>
                {subcat.name}
              </option>
            ))}
          </select>
          <div className="file-upload-wrapper">
            <label htmlFor="item-file-input" className="custom-file-upload">
              {itemData.image ? (
                <div className="file-preview">
                  <img
                    src={URL.createObjectURL(itemData.image)}
                    alt="Preview"
                  />
                  <span>Change Image</span>
                </div>
              ) : (
                <span>Drag & Drop or Click to Upload</span>
              )}
              <input
                id="item-file-input"
                type="file"
                onChange={(e) =>
                  setItemData({ ...itemData, image: e.target.files[0] })
                }
                hidden
              />
            </label>
          </div>
          <button className="btns" type="submit">
            Add Item
          </button>
        </form>
      </section>
      </div>

    
      </>
      )}
    </div>
  );
};

export default Add;