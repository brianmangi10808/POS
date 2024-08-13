// src/CategoryManager.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Category.css'
import { DeleteIcon,EditIcon } from '@chakra-ui/icons'




// URL of your API
const API_URL = 'http://localhost:3000/api/categories';

const Category= () => {
    const [categories, setCategories] = useState([]);
    const [name, setName] = useState('');
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get(API_URL);
            setCategories(response.data);
        } catch (err) {
            setError('Error fetching categories');
        }
    };

    const handleCreateOrUpdate = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (editingCategoryId) {
                await axios.put(`${API_URL}/${editingCategoryId}`, { name });
            } else {
                await axios.post(API_URL, { name });
            }
            fetchCategories();
            setName('');
            setEditingCategoryId(null);
        } catch (err) {
            setError(err.response ? err.response.data.error : 'Error saving category');
        }
    };

    const handleEdit = (category) => {
        setName(category.name);
        setEditingCategoryId(category.id);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}`);
            fetchCategories();
        } catch (err) {
            setError(err.response ? err.response.data.error : 'Error deleting category');
        }
    };

    return (
        <div>
          
            <form onSubmit={handleCreateOrUpdate} className='category-form'>
                <div className='category-input'>
                    <label>Category Name</label>
                    <input
                        type="text"
                        placeholder='Type category name ..'
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                {error && <p>{error}</p>}
                <button type="submit">
                    {editingCategoryId ? 'Update Category' : 'Create Category'}
                </button>
            </form>
           <div className="Category-list">
            {/* <h2>Categories</h2> */}
            {categories.length === 0 ? (
                <p>No categories found</p>
            ) : (
                <ul>
                    {categories.map((category) => (
                        <li key={category.id}>
                            <div className=""> {category.id}  {category.name}</div>
                          
                            <div className="category-button">
                            <button onClick={() => handleEdit(category)}><EditIcon boxSize={15} /></button>
                            <button onClick={() => handleDelete(category.id)}><DeleteIcon boxSize={15}/></button>
                       </div>
                       
                        </li>
                    ))}
                </ul>
            )}
          </div>
        </div>
    );
};

export default Category;
