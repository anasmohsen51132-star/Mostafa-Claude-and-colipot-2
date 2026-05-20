import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const RoleGuard = ({ children, roles }: { children: JSX.Element; roles: string[] }) => {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};
