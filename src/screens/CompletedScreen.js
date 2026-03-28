import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CompletedScreen() {
  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
        <View>
            <Text>Completed Screen</Text>
        </View>
    </SafeAreaView>
  );
}