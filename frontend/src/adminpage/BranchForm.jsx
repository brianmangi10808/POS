import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { DeleteIcon, EditIcon } from '@chakra-ui/icons';


// URL of your API
const API_URL = 'http://localhost:3000/branches';

const BranchForm= () => {
    const [branches, setBranches] = useState([]);
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [editingBranchId, setEditingBranchId] = useState(null);
    const [error, setError] = useState('');

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

    return (
        <div>
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
            <div className="Branch-list">
                {branches.length === 0 ? (
                    <p>No branches found</p>
                ) : (
                    <ul>
                        {branches.map((branch) => (
                            <li key={branch.id}>
                                <div> {branch.id}  {branch.name} - {branch.location}</div>
                                <div className="branch-button">
                                    <button onClick={() => handleEdit(branch)}><EditIcon boxSize={15} /></button>
                                    <button onClick={() => handleDelete(branch.id)}><DeleteIcon boxSize={15} /></button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default BranchForm;
