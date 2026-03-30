import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import WorkspaceScreen from "../screens/WorkspaceScreen";
import TodoScreen from "../screens/TodoScreen";
import CompletedScreen from "../screens/CompletedScreen";
import UsersScreen from "../screens/UsersScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();
const isAdmin = true; // change later from backend

export default function BottomTabs({ setIsLoggedIn }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Workspace") iconName = "business";
          else if (route.name === "ToDo") iconName = "list";
          else if (route.name === "Completed") iconName = "checkmark-done";
          else if (route.name === "Users") iconName = "people";
          else if (route.name === "Profile") iconName = "person";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "blue",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Workspace" component={WorkspaceScreen} />
      <Tab.Screen name="ToDo" component={TodoScreen} />
      <Tab.Screen name="Completed" component={CompletedScreen} />
      {isAdmin && (
        <Tab.Screen name="Users" component={UsersScreen} />
      )}
      <Tab.Screen name="Profile">
        {(props) => (
          <ProfileScreen {...props} setIsLoggedIn={setIsLoggedIn} />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}