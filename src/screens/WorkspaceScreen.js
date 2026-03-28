import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WorkspaceScreen() {
  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
        <View>
            <Text>Workspace Screen</Text>
        </View>
    </SafeAreaView>
    
  );
}