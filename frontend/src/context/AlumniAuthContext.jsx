import { createContext, useContext, useEffect, useState } from "react";
import { alumniAuthApi } from "../api/alumniAuth";

const AlumniAuthCtx = createContext(null);

export function AlumniAuthProvider({ children }) {
  const [alumniUser, setAlumniUser] = useState(undefined); // undefined = loading
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    alumniAuthApi.me()
      .then((r) => setAlumniUser(r.data))
      .catch(() => setAlumniUser(null))
      .finally(() => setLoading(false));
  }, []);

  const alumniLogin = async (email, password) => {
    const r = await alumniAuthApi.login(email, password);
    setAlumniUser(r.data);
    return r.data;
  };

  const alumniLogout = async () => {
    await alumniAuthApi.logout();
    setAlumniUser(null);
  };

  return (
    <AlumniAuthCtx.Provider value={{ alumniUser, loading, alumniLogin, alumniLogout, setAlumniUser }}>
      {children}
    </AlumniAuthCtx.Provider>
  );
}

export const useAlumniAuth = () => useContext(AlumniAuthCtx);
