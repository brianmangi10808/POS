import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Users() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [branchId, setBranchId] = useState('');
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        // Fetch branches for the dropdown
        axios.get('http://localhost:3000/api/branches')
            .then(response => setBranches(response.data))
            .catch(error => console.error('Error fetching branches:', error));
    }, []);

   
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await axios.post('http://localhost:3000/api/users', {
                name,
                email,
                password,
                role,
                branch_id: branchId
            });
            setSuccess('User created successfully');
            // Reset form after successful creation
            setName('');
            setEmail('');
            setPassword('');
            setRole('user');
            setBranchId('');
        } catch (error) {
            console.error('Error creating user:', error.response ? error.response.data : error.message);
            setError(error.response ? error.response.data.error : 'Failed to create user');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div>
            <h1>Create User</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Name:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Role:</label>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        required
                    >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div>
                    <label>Branch:</label>
                    <select
                        value={branchId}
                        onChange={(e) => setBranchId(e.target.value)}
                        required
                    >
                        <option value="">Select a branch</option>
                        {branches.map(branch => (
                            <option key={branch.id} value={branch.id}>
                                {branch.name}
                            </option>
                        ))}
                    </select>
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create User'}
                </button>
            </form>
        </div>
    );
}

export default Users;
