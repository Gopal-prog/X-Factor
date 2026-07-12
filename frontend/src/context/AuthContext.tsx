import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import type { AuthUser, LoginPayload } from "@/types";
import { login as loginRequest } from "@/api/services";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_USER_KEY = "auth_user";

export function AuthProvider({ children }: { children: ReactNode }) {

  const [user, setUser] = useState<AuthUser | null>(() => {
  try {
    const raw = localStorage.getItem(STORAGE_USER_KEY);

    if (!raw || raw === "undefined") {
      return null;
    }

    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(STORAGE_USER_KEY);
    return null;
  }
});

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (payload: LoginPayload) => {

    setIsLoading(true);

    setError(null);

    try {

      const res = await loginRequest(payload);

      const user: AuthUser = {

        id: String(res.user_id),

        name: res.full_name,

        email: "",

        role: res.role,

        department: res.department

      };

      localStorage.setItem(

        STORAGE_USER_KEY,

        JSON.stringify(user)

      );

      setUser(user);

    }

    catch (err) {

      const message =

        (err as { message?: string })?.message ||

        "Login Failed";

      setError(message);

      throw err;

    }

    finally {

      setIsLoading(false);

    }

  }, []);

  const logout = useCallback(() => {

    localStorage.removeItem(STORAGE_USER_KEY);

    setUser(null);

  }, []);

  return (

    <AuthContext.Provider

      value={{

        user,

        isAuthenticated: !!user,

        isLoading,

        error,

        login,

        logout

      }}

    >

      {children}

    </AuthContext.Provider>

  );

}

export function useAuth() {

  const context = useContext(AuthContext);

  if (!context)

    throw new Error(

      "useAuth must be used inside AuthProvider"

    );

  return context;

}