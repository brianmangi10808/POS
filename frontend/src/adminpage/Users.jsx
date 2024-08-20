import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Users() {
    const [users, setUsers] = useState([]);
    const [branches, setBranches] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('');

    // Fetch users with branch details
    useEffect(() => {
        axios.get('http://localhost:3000/api/users-with-branches')
            .then(response => setUsers(response.data))
            .catch(error => console.error('Error fetching users:', error));
    }, []);

    // Fetch branches
    useEffect(() => {
        axios.get('http://localhost:3000/api/branches')
            .then(response => setBranches(response.data))
            .catch(error => console.error('Error fetching branches:', error));
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

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h2>Assign Branch to User</h2>
            <div style={{ marginBottom: '20px' }}>
            <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
    <option value="">Select User</option>
    {Array.isArray(users) && users.map(user => (
        <option key={user.id} value={user.id}>{user.name}</option>
    ))}
</select>




                <select value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)}>
                    <option value="">Select Branch</option>
                    {Array.isArray(branches) && branches.map(branch => (
                        <option key={branch.id} value={branch.id}>{branch.name}</option>
                    ))}
                </select>

                <button onClick={handleAssign}>Assign Branch</button>
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
        users.map(user => (
            <tr key={user.user_id}>
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
