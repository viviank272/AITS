import { useCallback, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Custom hook for logout functionality
 * Provides a method to handle user logout consistently across the app
 */
export const useLogout = () => {
  const { logout: authLogout } = useContext(AuthContext);
  
  const logout = useCallback(async () => {
    try {
      // Call the auth context logout function
      await authLogout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [authLogout]);
  
  return logout;
};

export default useLogout; 