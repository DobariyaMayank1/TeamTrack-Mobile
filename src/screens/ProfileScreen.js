import { View, Text, Button, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useContext } from "react";
import { WorkspaceContext } from "../context/WorkspaceContext";

export default function ProfileScreen({ setIsLoggedIn }) {
  const { changeWorkspace } = useContext(WorkspaceContext); // ✅ reset context too

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          await AsyncStorage.removeItem("token");
          await changeWorkspace(null); // ✅ clears both AsyncStorage AND context state
          setIsLoggedIn(false);
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Profile Screen</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}