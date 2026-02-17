import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "@/auth/auth-context";

type RequireAuthProps = {
  children: ReactNode;
  roles?: string[];
};

export function RequireAuth({ children, roles }: RequireAuthProps) {
  const location = useLocation();
  const { hasRole, isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <div className="grid min-h-screen place-items-center bg-muted/20 p-6 text-center">
        <div className="space-y-2">
          <p className="text-base font-medium">Memeriksa sesi login...</p>
          <p className="text-sm text-muted-foreground">Pastikan backend berjalan di localhost:5238.</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && !roles.some((role) => hasRole(role))) {
    return <Navigate to="/forbidden" replace />;
  }

  return <>{children}</>;
}
