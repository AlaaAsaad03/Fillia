import React from 'react';
import AdminNavbar from '../admin/Navbar/Navbar'; // Adjust the import path as necessary
import Navbar from '../user/Navbar/Navbar';
import { useAuthStore } from '../context/authStore';

const CombinedNavbar = ({  }) => {
    const {user} = useAuthStore();

    if (!user) {
        return null; // No user logged in, you might want to show a public navbar or nothing
    }

   // Check if the user has an admin role
   return user.role === 'admin' || user.role === 'Packager'|| user.role === 'Leader' || user.role === 'Delivery' ? (
    <AdminNavbar />
) : (
    <Navbar />
);
};
export default CombinedNavbar;