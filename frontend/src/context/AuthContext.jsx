import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Initialize state directly from LocalStorage so there is no flicker on refresh
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // only verify that the token exists physically.
    // real validity checks happen when we try to fetch data from API.
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      setToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  const login = (accessToken) => {
    // -------------------------------------------------------------------------
    // SECURITY NOTE: Storing JWT in LocalStorage for simplicity.
    // In a high-security production environment (FinTech/Healthcare),
    // we would refactor this to use HttpOnly cookies to mitigate XSS attacks.
    // -------------------------------------------------------------------------
    localStorage.setItem('access_token', accessToken);
    setToken(accessToken);
  };

  const logout = () => {
    localStorage.removeItem('access_Token');
    setToken(null);
  };

  return (
  <AuthContext.Provider value={{ token, login, logout, isLoading }}>
    {children}
  </AuthContext.Provider>
  );
}

// custom hook to make consuming simpler
export function useAuth() {
  return useContext(AuthContext)
}
