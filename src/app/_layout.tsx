import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ 
        headerStyle: { backgroundColor: '#2c3e50' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' }
      }}>
        <Stack.Screen name="index" options={{ title: 'Сімейна аптечка' }} />
        <Stack.Screen name="add" options={{ title: 'Додати ліки' }} />
        <Stack.Screen name="edit" options={{ title: 'Редагувати ліки' }} />
        <Stack.Screen name="schedule" options={{ title: 'Прийом ліків' }} />
        <Stack.Screen name="shopping" options={{ title: 'Треба докупити' }} />
        <Stack.Screen name="compatibility" options={{ title: 'Сумісність' }} />
      </Stack>
    </>
  );
}