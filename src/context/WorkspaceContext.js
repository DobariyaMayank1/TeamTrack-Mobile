import { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const WorkspaceContext = createContext();

export const WorkspaceProvider = ({ children }) => {
  const [workspaceId, setWorkspaceId] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadWorkspace();
  }, []);

  const loadWorkspace = async () => {
    try {
      const ws = await AsyncStorage.getItem("workspaceId");
      if (ws) setWorkspaceId(ws);
    } catch (err) {
      console.log("Error loading workspace:", err);
    } finally {
      setLoaded(true);
    }
  };

  const changeWorkspace = async (id) => {
    try {
      if (!id) {
        await AsyncStorage.removeItem("workspaceId");
        setWorkspaceId(null);
      } else {
        await AsyncStorage.setItem("workspaceId", id.toString());
        setWorkspaceId(id.toString());
      }
    } catch (err) {
      console.log("Error changing workspace:", err);
    }
  };

  return (
    <WorkspaceContext.Provider value={{ workspaceId, changeWorkspace, loaded }}>
      {children}
    </WorkspaceContext.Provider>
  );
};