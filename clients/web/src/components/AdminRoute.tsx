import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const AdminRoute: React.FC = () => {
    const token: string | null = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    try {
        const tokenDecoded: any = jwtDecode(token);

        if (tokenDecoded.role === "ADMIN") {
            return <Outlet />;
        }
    } catch (error) {
        console.error("Token invalide dans l'AdminRoute :", error);
    }

    return <Navigate to="/home" replace />;
};

export default AdminRoute;