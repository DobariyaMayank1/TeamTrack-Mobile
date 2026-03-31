import { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

import BottomTabs from "./src/navigation/BottomTabs";
import LoginScreen from "./src/screens/LoginScreen";
import { WorkspaceProvider } from "./src/context/WorkspaceContext";

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [initialTab, setInitialTab] = useState("Workspace"); // ✅ track where to land

  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    const token = await AsyncStorage.getItem("token");
    const workspaceId = await AsyncStorage.getItem("workspaceId");

    if (token) {
      setIsLoggedIn(true);
      // ✅ if workspace was saved before, skip workspace screen
      setInitialTab(workspaceId ? "ToDo" : "Workspace");
    } else {
      setIsLoggedIn(false);
    }
  };

  if (isLoggedIn === null) return null; // still checking

  return (
    <WorkspaceProvider>
      <NavigationContainer>
        <Stack.Navigator key={isLoggedIn ? "user" : "guest"}>
          {isLoggedIn ? (
            <Stack.Screen name="Main" options={{ headerShown: false }}>
              {(props) => (
                <BottomTabs
                  {...props}
                  setIsLoggedIn={setIsLoggedIn}
                  initialTab={initialTab} // ✅ pass it down
                />
              )}
            </Stack.Screen>
          ) : (
            <Stack.Screen name="Login" options={{ headerShown: false }}>
              {(props) => (
                <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} />
              )}
            </Stack.Screen>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </WorkspaceProvider>
  );
}