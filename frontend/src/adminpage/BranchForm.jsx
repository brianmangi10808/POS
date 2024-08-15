import React, { useState, useEffect } from 'react';
import axios from 'axios';

function BranchManager() {
    const [branches, setBranches] = useState([]);
    const [branch, setBranch] = useState({ id: '', name: '', location: '' });
    const [mode, setMode] = useState('view'); // 'view', 'create', 'edit'
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (mode === 'view') {
            fetchBranches();
        }
    }, [mode]);

    const fetchBranches = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/branches');
            setBranches(response.data);
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to fetch branches.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBranch({ ...branch, [name]: value });
    };

    const handleCreateBranch = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await axios.post('http://localhost:3000/api/branches', {
                name: branch.name,
                location: branch.location
            });
            if (response.status === 201) {
                setSuccess('Branch created successfully!');
                setBranch({ id: '', name: '', location: '' });
                setMode('view');
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to create branch.');
        }
    };

    const handleUpdateBranch = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await axios.put(`http://localhost:3000/api/branches/${branch.id}`, {
                name: branch.name,
                location: branch.location
            });
            if (response.status === 200) {
                setSuccess('Branch updated successfully!');
                setBranch({ id: '', name: '', location: '' });
                setMode('view');
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to update branch.');
        }
    };

    const handleDeleteBranch = async (id) => {
        try {
            const response = await axios.delete(`http://localhost:3000/api/branches/${id}`);
            if (response.status === 200) {
                setSuccess('Branch deleted successfully!');
                fetchBranches(); // Refresh the branch list
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to delete branch.');
        }
    };

    const handleEdit = (branch) => {
        setBranch(branch);
        setMode('edit');
    };

    return (
        <div>
            <h1>Branch Manager</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}

            {mode === 'view' && (
                <>
                    <button onClick={() => setMode('create')}>Add Branch</button>
                    <ul>
                        {branches.map(branch => (
                            <li key={branch.id}>
                                <h2>{branch.name}</h2>
                                <p>Location: {branch.location}</p>
                                <button onClick={() => handleEdit(branch)}>Edit</button>
                                <button onClick={() => handleDeleteBranch(branch.id)}>Delete</button>
                            </li>
                        ))}
                    </ul>
                </>
            )}

            {(mode === 'create' || mode === 'edit') && (
                <form onSubmit={mode === 'create' ? handleCreateBranch : handleUpdateBranch}>
                    <div>
                        <label>Name:</label>
                        <input
                            type="text"
                            name="name"
                            value={branch.name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div>
                        <label>Location:</label>
                        <input
                            type="text"
                            name="location"
                            value={branch.location}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <button type="submit">{mode === 'create' ? 'Create Branch' : 'Update Branch'}</button>
                    <button type="button" onClick={() => setMode('view')}>Cancel</button>
                </form>
            )}
        </div>
    );
}

export default BranchManager;
