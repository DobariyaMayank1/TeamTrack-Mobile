import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function TodoScreen() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);


  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [])
  );

  const fetchTasks = async () => {
    try {

      setLoading(true);
      
      const token = await AsyncStorage.getItem("token");
      const workspaceId = await AsyncStorage.getItem("workspaceId");

      if (!workspaceId) {
        setTasks([]);
        setLoading(false);
        return;
      }

      const res = await axios.get(
        `${API_URL}/api/workspace/task/list/${workspaceId}/?status=pending`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTasks(res.data);
      setLoading(false);
    } catch (err) {
      console.log("Error fetching tasks:", err);
      setLoading(false);
    }
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
        Pending Tasks
      </Text>

      {tasks.length === 0 ? (
        <SafeAreaView style={{ flex: 1, padding: 20 }}>
            <Text>Please select a workspace first</Text>
          </SafeAreaView>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View
              style={{
                padding: 15,
                borderWidth: 1,
                marginBottom: 10,
                borderRadius: 8,
              }}
            >
              <Text style={{ fontWeight: "bold" }}>{item.title}</Text>
              <Text>{item.description}</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}