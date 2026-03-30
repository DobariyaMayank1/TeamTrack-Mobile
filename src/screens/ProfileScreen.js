import { View, Text, Button, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfileScreen({ setIsLoggedIn }) {
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          await AsyncStorage.removeItem("token");
          await AsyncStorage.removeItem("workspaceId");

          setIsLoggedIn(false); // ✅ THIS is key
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