import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Users() {
    const [users, setUsers] = useState([]);
    const [branches, setBranches] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch users and branches
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersResponse, branchesResponse] = await Promise.all([
                    axios.get('http://localhost:3000/api/users-with-branches'),
                    axios.get('http://localhost:3000/api/branches')
                ]);
                console.log('Users:', usersResponse.data); // Debugging line
                setUsers(usersResponse.data);
                setBranches(branchesResponse.data);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Handle branch assignment
    const handleAssign = () => {
        if (!selectedUser || !selectedBranch) {
            alert('Please select both user and branch.');
            return;
        }

        axios.put(`http://localhost:3000/api/users/${selectedUser}/assign-branch`, { branch_id: selectedBranch })
            .then(response => alert(response.data.message))
            .catch(error => alert(error.response.data.error));
    };

    if (loading) return <p style={{ textAlign: 'center' }}>Loading...</p>;
    if (error) return <p style={{ color: 'red', textAlign: 'center' }}>Error: {error}</p>;

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h2>Assign Branch to User</h2>
            <div style={{ marginBottom: '20px' }}>
            <select
    value={selectedUser}
    onChange={e => setSelectedUser(e.target.value)}
    style={{ marginRight: '10px', padding: '8px' }}
>
    <option value="">Select User</option>
    {users.length > 0 ? (
        users.map((user) => (
            <option key={user.user_id} value={user.user_id}>
                {user.user_name}
            </option>
        ))
    ) : (
        <option disabled>No users available</option>
    )}
</select>



                <select
                    value={selectedBranch}
                    onChange={e => setSelectedBranch(e.target.value)}
                    style={{ marginRight: '10px', padding: '8px' }}
                >
                    <option value="">Select Branch</option>
                    {Array.isArray(branches) && branches.length > 0 ? (
                        branches.map((branch, index) => (
                            <option key={branch.id || index} value={branch.id}>
                                {branch.name}
                            </option>
                        ))
                    ) : (
                        <option disabled>No branches available</option>
                    )}
                </select>

                <button
                    onClick={handleAssign}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Assign Branch
                </button>
            </div>

            <h2>Users List</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f2f2f2' }}>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>User ID</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Name</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Email</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Role</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Branch ID</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Branch Name</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Branch Location</th>
                    </tr>
                </thead>
                <tbody>
                    {users.length > 0 ? (
                        users.map((user, index) => (
                            <tr key={user.user_id || index}>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.user_id}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.user_name}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.user_email}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.user_role}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.branch_id || 'N/A'}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.branch_name || 'N/A'}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.branch_location || 'N/A'}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>No users found</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default Users;
