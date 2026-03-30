import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function WorkspaceScreen({ navigation }) {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await axios.get(`${API_URL}/api/workspace/list/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setWorkspaces(res.data);
      setLoading(false);
    } catch (err) {
      console.log("Error fetching workspaces:", err);
      setLoading(false);
    }
  };

  const handleSelectWorkspace = async (id) => {
    await AsyncStorage.setItem("workspaceId", id.toString());

    navigation.navigate("ToDo");
  };

  if (loading) {
    return (
      <SafeAreaView>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>
        Your Workspaces
      </Text>

      {workspaces.length === 0 ? (
        <Text>No workspaces found</Text>
      ) : (
        <FlatList
          data={workspaces}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleSelectWorkspace(item.id)}
              style={{
                padding: 15,
                borderWidth: 1,
                marginBottom: 10,
                borderRadius: 8,
              }}
            >
              <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}