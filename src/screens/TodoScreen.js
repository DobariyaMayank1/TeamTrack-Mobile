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

  // ✅ Edit state
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  // ✅ Complete state
  const [completingTaskId, setCompletingTaskId] = useState(null);
  const [completionDescription, setCompletionDescription] = useState("");

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
      if (err.name !== "CanceledError") {
        Alert.alert("Error", "Failed to load tasks");
      }
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
    } catch {
      Alert.alert("Error", "Failed to create task");
    }
  };

  // ✏️ EDIT TASK
  const handleEditPress = (task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
  };

  const handleEditSave = async () => {
    if (!editTitle.trim()) {
      Alert.alert("Validation", "Title cannot be empty");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");

      await axios.put(
        `${API_URL}/api/workspace/task/update/${editingTaskId}/`,
        { title: editTitle.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEditingTaskId(null);
      setEditTitle("");
      fetchTasks();
    } catch {
      Alert.alert("Error", "Failed to update task");
    }
  };

  // 🗑 DELETE TASK
  const handleDelete = (taskId) => {
    Alert.alert("Delete Task", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
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
          } catch {
            Alert.alert("Error", "Failed to delete task");
          }
        },
      },
    ]);
  };

  // ✅ COMPLETE TASK
  const handleCompletePress = (taskId) => {
    setCompletingTaskId(taskId);
    setCompletionDescription("");
  };

  const handleCompleteSubmit = async () => {
    if (!completionDescription.trim()) {
      Alert.alert("Validation", "Description required");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");

      await axios.post(
        `${API_URL}/api/workspace/task/complete/${completingTaskId}/`,
        { description: completionDescription.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCompletingTaskId(null);
      setCompletionDescription("");
      fetchTasks();
    } catch {
      Alert.alert("Error", "Failed to complete task");
    }
  };

  const handlePickerChange = (value) => {
    if (!value || value === workspaceId) return;
    changeWorkspace(value);
  };

  if (!loaded) {
    return <ActivityIndicator size="large" />;
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
      ) : (
        <>
          <Button title="Create Task" onPress={() => setShowForm(!showForm)} />

          {showForm && (
            <View style={{ marginVertical: 10 }}>
              <TextInput
                placeholder="Task Title"
                value={title}
                onChangeText={setTitle}
                style={{ borderWidth: 1, padding: 8 }}
              />
              <Button title="Submit" onPress={handleCreateTask} />
            </View>
          )}

          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={{ padding: 15, borderWidth: 1, marginVertical: 5 }}>
                
                {/* ✏️ EDIT MODE */}
                {editingTaskId === item.id ? (
                  <>
                    <TextInput
                      value={editTitle}
                      onChangeText={setEditTitle}
                      style={{ borderWidth: 1, padding: 8, marginBottom: 10 }}
                    />
                    <Button title="Save" onPress={handleEditSave} />
                    <Button
                      title="Cancel"
                      onPress={() => setEditingTaskId(null)}
                    />
                  </>
                ) : (
                  <>
                    <Text style={{ fontWeight: "bold" }}>{item.title}</Text>

                    {/* COMPLETE */}
                    {completingTaskId === item.id ? (
                      <>
                        <TextInput
                          placeholder="Completion note"
                          value={completionDescription}
                          onChangeText={setCompletionDescription}
                          style={{ borderWidth: 1, padding: 8, marginVertical: 10 }}
                        />
                        <Button title="Submit" onPress={handleCompleteSubmit} />
                      </>
                    ) : (
                      <Button
                        title="Complete"
                        onPress={() => handleCompletePress(item.id)}
                      />
                    )}

                    {/* ACTION BUTTONS */}
                    <View style={{ flexDirection: "row", marginTop: 10, gap: 10 }}>
                      <Button title="Edit" onPress={() => handleEditPress(item)} />
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
        </>
      )}
    </SafeAreaView>
  );
}