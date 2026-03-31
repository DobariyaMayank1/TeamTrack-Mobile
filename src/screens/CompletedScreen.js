import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  Button,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useContext, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Picker } from "@react-native-picker/picker";
import { WorkspaceContext } from "../context/WorkspaceContext";
import { useFocusEffect } from "@react-navigation/native";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function CompletedScreen() {
  const { workspaceId, changeWorkspace, loaded } = useContext(WorkspaceContext);

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [workspaces, setWorkspaces] = useState([]);

  // ✅ edit state
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

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
        `${API_URL}/api/workspace/task/list/${workspaceId}/?status=completed`,
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

  const handlePickerChange = (value) => {
    if (!value || value === workspaceId) return;
    changeWorkspace(value);
  };

  // ✅ DELETE
  const handleDelete = (taskId) => {
    Alert.alert("Delete", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token");
            await axios.delete(
              `${API_URL}/api/workspace/task/delete/${taskId}/`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchTasks();
          } catch (err) {
            console.log(err);
            Alert.alert("Error", "Failed to delete task");
          }
        },
      },
    ]);
  };

  // ✅ START EDIT
  const handleEdit = (task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
  };

  // ✅ SUBMIT EDIT
  const handleEditSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      await axios.put(
        `${API_URL}/api/workspace/task/update/${editingTaskId}/`,
        {
          title: editTitle,
          description: editDescription,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEditingTaskId(null);
      fetchTasks();
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to update task");
    }
  };

  if (!loaded) {
    return (
      <SafeAreaView>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
      <Picker selectedValue={workspaceId || ""} onValueChange={handlePickerChange}>
        <Picker.Item label="Select Workspace" value="" />
        {workspaces.map((ws) => (
          <Picker.Item key={ws.id} label={ws.name} value={ws.id.toString()} />
        ))}
      </Picker>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : !workspaceId ? (
        <Text>Please select a workspace first</Text>
      ) : (
        <>
          <Text style={{ fontSize: 20, marginBottom: 10 }}>
            Completed Tasks
          </Text>

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
                    borderRadius: 8,
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  {editingTaskId === item.id ? (
                    <>
                      <TextInput
                        value={editTitle}
                        onChangeText={setEditTitle}
                        style={{ borderWidth: 1, marginBottom: 5 }}
                      />
                      <TextInput
                        value={editDescription}
                        onChangeText={setEditDescription}
                        style={{ borderWidth: 1, marginBottom: 5 }}
                      />
                      <Button title="Save" onPress={handleEditSubmit} />
                      <Button
                        title="Cancel"
                        onPress={() => setEditingTaskId(null)}
                      />
                    </>
                  ) : (
                    <>
                      <Text style={{ fontWeight: "bold" }}>
                        {item.title}
                      </Text>

                      <Text>{item.description || "No description"}</Text>

                      <Text style={{ color: "green" }}>
                        Completed by: {item.completed_by_name || "Unknown"}
                      </Text>

                      <View style={{ flexDirection: "row", gap: 10 }}>
                        <Button title="Edit" onPress={() => handleEdit(item)} />
                        <Button
                          title="Delete"
                          color="red"
                          onPress={() => handleDelete(item.id)}
                        />
                      </View>
                    </>
                  )}
                </View>
              )}
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}