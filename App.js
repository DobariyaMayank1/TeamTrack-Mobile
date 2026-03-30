import { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

import BottomTabs from "./src/navigation/BottomTabs";
import LoginScreen from "./src/screens/LoginScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null); // 👈 important

  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    const token = await AsyncStorage.getItem("token");
    setIsLoggedIn(!!token);
    console.log("isLoggedIn:", isLoggedIn);
  };

  // ⏳ wait until checked
  if (isLoggedIn === null) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator key={isLoggedIn ? "user" : "guest"}>
        {isLoggedIn ? (
          <Stack.Screen name="Main" options={{ headerShown: false }}>
            {(props) => (
              <BottomTabs {...props} setIsLoggedIn={setIsLoggedIn} />
            )}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Login">
            {(props) => (
              <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} />
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}