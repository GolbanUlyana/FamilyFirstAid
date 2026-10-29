import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getMedicines, saveMedicines } from '../utils/storage';

export default function AddScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [debugMsg, setDebugMsg] = useState('');

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') { setDebugMsg('Немає дозволу на галерею'); return; }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.5 });
      if (!result.canceled && result.assets.length > 0) setPhoto(result.assets[0].uri);
    } catch (error) { setDebugMsg('Помилка фото'); }
  };

  const handleSave = async () => {
    if (!name.trim()) { setDebugMsg('Введіть назву ліків!'); return; }
    try {
      const newMed = { id: Date.now().toString(), name: name.trim(), dosage: dosage.trim(), expiryDate: expiryDate.trim(), photo: photo, isInShoppingList: false };
      const currentMeds = await getMedicines();
      await saveMedicines([...currentMeds, newMed]);
      router.replace('/');
    } catch (error: any) { setDebugMsg('ПОМИЛКА: ' + error.message); }
  };

  return (
    <ScrollView style={styles.container}>
      {debugMsg ? <Text style={{ color: 'red', marginBottom: 10 }}>{debugMsg}</Text> : null}
      <View style={styles.photoSection}>
        <TouchableOpacity style={styles.photoBtn} onPress={pickImage}>
          {photo ? <Image source={{ uri: photo }} style={styles.previewImage} /> : 
          <View style={styles.photoPlaceholder}><Ionicons name="camera" size={40} color="#95a5a6" /><Text style={styles.photoText}>Обрати фото</Text></View>}
        </TouchableOpacity>
      </View>
      <Text style={styles.label}>Назва ліків *</Text>
      <TextInput style={styles.input} placeholder="Наприклад: Аспірин" placeholderTextColor="#a0aab2" value={name} onChangeText={setName} />
      <Text style={styles.label}>Дозування</Text>
      <TextInput style={styles.input} placeholder="500 мг" placeholderTextColor="#a0aab2" value={dosage} onChangeText={setDosage} />
      <Text style={styles.label}>Термін придатності (РРРР-ММ)</Text>
      <TextInput style={styles.input} placeholder="2025-12" placeholderTextColor="#a0aab2" value={expiryDate} onChangeText={setExpiryDate} />
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Зберегти</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  photoSection: { alignItems: 'center', marginVertical: 10 },
  photoBtn: { width: 120, height: 120, borderRadius: 15, overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%' },
  photoPlaceholder: { width: '100%', height: '100%', backgroundColor: '#ecf0f1', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#bdc3c7', borderStyle: 'dashed', borderRadius: 15 },
  photoText: { fontSize: 12, color: '#95a5a6', marginTop: 5 },
  label: { fontSize: 14, fontWeight: '600', color: '#34495e', marginBottom: 5, marginTop: 15 },
  input: { borderWidth: 1, borderColor: '#bdc3c7', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#f9f9f9', color: '#2c3e50' },
  saveBtn: { backgroundColor: '#27ae60', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 30, marginBottom: 50 },
  saveBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});