import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { getMedicines, saveMedicines } from '../utils/storage';

export default function EditScreen() {
  const router = useRouter();
  const { id, name: initName, dosage: initDosage, expiryDate: initExpiry } = useLocalSearchParams();
  
  const [name, setName] = useState((initName as string) || '');
  const [dosage, setDosage] = useState((initDosage as string) || '');
  const [expiryDate, setExpiryDate] = useState((initExpiry as string) || '');

  const handleUpdate = async () => {
    if (!name.trim()) return;
    const allMeds = await getMedicines();
    const updated = allMeds.map(m => m.id === id ? { ...m, name: name.trim(), dosage, expiryDate } : m);
    await saveMedicines(updated);
    router.replace('/');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Назва ліків *</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />
      <Text style={styles.label}>Дозування</Text>
      <TextInput style={styles.input} value={dosage} onChangeText={setDosage} />
      <Text style={styles.label}>Термін придатності (РРРР-ММ)</Text>
      <TextInput style={styles.input} value={expiryDate} onChangeText={setExpiryDate} />
      <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate}>
        <Text style={styles.saveBtnText}>Оновити дані</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#34495e', marginBottom: 5, marginTop: 15 },
  input: { borderWidth: 1, borderColor: '#bdc3c7', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#f9f9f9' },
  saveBtn: { backgroundColor: '#f39c12', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 30 },
  saveBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});