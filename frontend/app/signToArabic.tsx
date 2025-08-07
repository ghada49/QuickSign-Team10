import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';

export default function ComponentName() { // ← Must match filename!
  const router = useRouter();
  
  return (
    <View>
      <Text>Screen Content Here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Your styles...
});