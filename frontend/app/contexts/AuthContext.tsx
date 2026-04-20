import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useAppDispatch, useAppSelector } from "~/redux/store/hooks";
import { fetchCurrentUser } from "~/services/httpServices/authService";
import { logout } from "~/redux/features/authSlice";
import { fetchMyMess } from "~/redux/features/messSlice";
import { setupInterceptors } from "~/services/httpMethods/interceptors";
import httpService from "~/services/httpService";
import type { AuthUser } from "~/types/auth.d";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  signOut: () => undefined,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading } = useAppSelector((s) => s.auth);

  useEffect(() => {
    setupInterceptors(httpService, () => dispatch(logout()));
    dispatch(fetchCurrentUser()).then((result) => {
      if (fetchCurrentUser.fulfilled.match(result)) {
        dispatch(fetchMyMess());
      }
    });
  }, [dispatch]);

  function signOut() {
    dispatch(logout());
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
