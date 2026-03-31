import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Button,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useContext, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Picker } from "@react-native-picker/picker";
import { WorkspaceContext } from "../context/WorkspaceContext";
import { useFocusEffect } from "@react-navigation/native";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function TodoScreen() {
  const { workspaceId, changeWorkspace, loaded } = useContext(WorkspaceContext);

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [workspaces, setWorkspaces] = useState([]);

  const abortControllerRef = useRef(null);

  useEffect(() => {
    fetchWorkspaces();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!loaded) return;
      fetchTasks();
    }, [workspaceId, loaded])
  );

  const fetchWorkspaces = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/workspace/list/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWorkspaces(res.data);
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to load workspaces");
    }
  };

  const fetchTasks = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    if (!workspaceId) {
      setTasks([]);
      return;
    }

    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      const res = await axios.get(
        `${API_URL}/api/workspace/task/list/${workspaceId}/?status=pending`,
        {
          headers: { Authorization: `Bearer ${token}` },
          signal: abortControllerRef.current.signal,
        }
      );

      setTasks(res.data);
    } catch (err) {
      if (err.name === "CanceledError") return;
      console.log(err);
      Alert.alert("Error", "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!title.trim()) {
      Alert.alert("Validation", "Task title is required");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");

      await axios.post(
        `${API_URL}/api/workspace/task/create/`,
        { title: title.trim(), workspace: workspaceId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTitle("");
      setShowForm(false);
      fetchTasks();
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to create task");
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const token = await AsyncStorage.getItem("token");

      await axios.post(
        `${API_URL}/api/workspace/task/complete/${taskId}/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchTasks();
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to complete task");
    }
  };

  const handlePickerChange = (value) => {
    if (!value || value === workspaceId) return;
    changeWorkspace(value);
  };

  // ✅ LOADED GUARD
  if (!loaded) {
    return (
      <SafeAreaView>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
      <Picker
        selectedValue={workspaceId || ""}
        onValueChange={handlePickerChange}
      >
        <Picker.Item label="Select Workspace" value="" />
        {workspaces.map((ws) => (
          <Picker.Item
            key={ws.id}
            label={ws.name}
            value={ws.id.toString()}
          />
        ))}
      </Picker>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : !workspaceId ? (
        <Text>Please select a workspace first</Text>
      ) : (
        <>
          <Text style={{ fontSize: 20 }}>Pending Tasks</Text>

          <Button
            title="Create Task"
            onPress={() => setShowForm(!showForm)}
          />

          {showForm && (
            <View style={{ marginVertical: 10 }}>
              <TextInput
                placeholder="Task Title"
                value={title}
                onChangeText={setTitle}
                style={{ borderWidth: 1, padding: 8 }}
              />
              <Button title="Submit Task" onPress={handleCreateTask} />
            </View>
          )}

          {tasks.length === 0 ? (
            <Text>No tasks found</Text>
          ) : (
            <FlatList
              data={tasks}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View
                  style={{
                    padding: 15,
                    borderWidth: 1,
                    marginVertical: 5,
                  }}
                >
                  <Text>{item.title}</Text>
                  <Text>{item.description}</Text>
                  <Button
                    title="Complete"
                    onPress={() => handleCompleteTask(item.id)}
                  />
                </View>
              )}
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}