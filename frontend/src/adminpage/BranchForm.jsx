import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Branch.css'
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { BsFilterSquareFill } from "react-icons/bs";

// URL of your API
const API_URL = 'http://localhost:3000/api/branches';
const AGGREGATED_QUANTITIES_URL = 'http://localhost:3000/api/aggregated-quantities';

const BranchForm = () => {
    const [branches, setBranches] = useState([]);
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [editingBranchId, setEditingBranchId] = useState(null);
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [branchFilter, setBranchFilter] = useState('');
    const [productFilter, setProductFilter] = useState('');
    const [error, setError] = useState(null);
    const [isFormVisible, setIsFormVisible] = useState(false); // For Create/Update form visibility
    const [isFilterVisible, setIsFilterVisible] = useState(false); // For Filter section visibility

   
    const toggleFormVisibility = () => {
        setIsFormVisible(!isFormVisible);
    };

    const toggleFilterVisibility = () => {
        setIsFilterVisible(!isFilterVisible);
    };
    // Fetch aggregated quantities
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(AGGREGATED_QUANTITIES_URL);
                setData(response.data);
                setFilteredData(response.data); // Initialize filtered data
            } catch (err) {
                setError(err.message);
            }
        };

        fetchData();
    }, []);

    // Fetch branches
    useEffect(() => {
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        try {
            const response = await axios.get(API_URL);
            setBranches(response.data);
        } catch (err) {
            setError('Error fetching branches');
        }
    };

    const handleCreateOrUpdate = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (editingBranchId) {
                await axios.put(`${API_URL}/${editingBranchId}`, { name, location });
            } else {
                await axios.post(API_URL, { name, location });
            }
            fetchBranches();
            setName('');
            setLocation('');
            setEditingBranchId(null);
        } catch (err) {
            setError(err.response ? err.response.data.error : 'Error saving branch');
        }
    };

    const handleEdit = (branch) => {
        setName(branch.name);
        setLocation(branch.location);
        setEditingBranchId(branch.id);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}`);
            fetchBranches();
        } catch (err) {
            setError(err.response ? err.response.data.error : 'Error deleting branch');
        }
    };

    // Filter data based on branch and product
    useEffect(() => {
        const filtered = data.filter(item => 
            (branchFilter === '' || item.branch_name.toLowerCase().includes(branchFilter.toLowerCase())) &&
            (productFilter === '' || item.product_name.toLowerCase().includes(productFilter.toLowerCase()))
        );
        setFilteredData(filtered);
    }, [branchFilter, productFilter, data]);

    return (
        <div>
             <button className='filter-create' onClick={toggleFormVisibility}>
                CREATE & UPDATE BRANCH
            </button>

            {/* Form for creating/updating branches */}
            {isFormVisible && (
                <div id="TestsDiv">
                    <form onSubmit={handleCreateOrUpdate} className='branch-form'>
                        <div className='branch-input'>
                            <label>Branch Name</label>
                            <input
                                type="text"
                                placeholder='Type branch name ..'
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className='branch-input'>
                            <label>Branch Location</label>
                            <input
                                type="text"
                                placeholder='Type branch location ..'
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                required
                            />
                        </div>
                        {error && <p>{error}</p>}
                        <button type="submit">
                            {editingBranchId ? 'Update Branch' : 'Create Branch'}
                        </button>
                    </form>
                </div>
            )}
       
            <div className="Branch-list">
                {branches.length === 0 ? (
                    <p>No branches found</p>
                ) : (
                    <ul>
                        {branches.map((branch) => (
                            <li key={branch.id}>
                                <div>{branch.name} - {branch.location}</div>
                                <div className="branch-button">
                                <button onClick={() => { handleEdit(branch); toggleFormVisibility(); }}>
                                  <EditIcon boxSize={18} />
                               </button>

                                    <button onClick={() => handleDelete(branch.id)}><DeleteIcon boxSize={18} /></button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div>
                <h2>Aggregated Quantities</h2>
                <button className='filter-btn' onClick={toggleFilterVisibility}> <BsFilterSquareFill
                style={{
                    fontSize: '24px', 
                    color: 'grey' 
                }}
            /></button>
                {isFilterVisible  && (
                <div id="TestsDiv">
                   <div className="filters">
                    <div className="filter-input">
                        <label>Filter by Branch Name</label>
                        <input
                            type="text"
                            placeholder='Type branch name ..'
                            value={branchFilter}
                            onChange={(e) => setBranchFilter(e.target.value)}
                        />
                    </div>
                    <div className="filter-input">
                        <label>Filter by Product Name</label>
                        <input
                            type="text"
                            placeholder='Type product name ..'
                            value={productFilter}
                            onChange={(e) => setProductFilter(e.target.value)}
                        />
                    </div>
                </div>
                </div>
            )}
          
                <table>
                    <thead>
                        <tr>
                            <th>Branch Name</th>
                            <th>Product Name</th>
                            <th>Total Quantity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.length === 0 ? (
                            <tr>
                                <td colSpan="3">No data found</td>
                            </tr>
                        ) : (
                            filteredData.map((item) => (
                                <tr key={`${item.branch_name}-${item.product_name}`}>
                                    <td>{item.branch_name}</td>
                                    <td>{item.product_name}</td>
                                    <td>{item.total_quantity}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BranchForm;
