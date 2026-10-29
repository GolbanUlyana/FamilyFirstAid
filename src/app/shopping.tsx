import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getMedicines, Medicine, saveMedicines } from '../utils/storage';

export default function ShoppingScreen() {
  const [meds, setMeds] = useState<Medicine[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadMeds();
    }, [])
  );

  const loadMeds = async () => {
    const data = await getMedicines();
    // Показуємо тільки ті, що в кошику
    setMeds(data.filter(m => m.isInShoppingList === true));
  };

  // Додати новий запис прямо в кошик
  const handleAddDirectly = async () => {
    if (!newItemName.trim()) return;
    
    try {
      const allMeds = await getMedicines();
      const newMed: Medicine = {
        id: Date.now().toString(),
        name: newItemName.trim(),
        dosage: '',
        expiryDate: '',
        photo: null,
        isInShoppingList: true, // Одразу в кошик
      };
      
      await saveMedicines([...allMeds, newMed]);
      setNewItemName('');
      setIsAdding(false);
      loadMeds();
    } catch (error) {
      alert("Помилка: не вдалося додати в кошик");
    }
  };

  // Позначити як "куплено" (перемістити на головну)
  const handleMoveToMain = async (id: string) => {
    try {
      const allMeds = await getMedicines();
      const updated = allMeds.map(m => m.id === id ? { ...m, isInShoppingList: false } : m);
      await saveMedicines(updated);
      loadMeds();
    } catch (error) {
      alert("Помилка переміщення");
    }
  };

  // Видалити назавжди
  const handleDelete = async (id: string) => {
    try {
      const allMeds = await getMedicines();
      const updated = allMeds.filter(m => m.id !== id);
      await saveMedicines(updated);
      loadMeds();
    } catch (error) {
      alert("Помилка видалення");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🛒 Що треба докупити:</Text>

      {/* Форма швидкого додавання */}
      {isAdding ? (
        <View style={styles.addForm}>
          <TextInput 
            style={styles.input} 
            placeholder="Назва ліків (напр. Вітамін С)" 
            placeholderTextColor="#a0aab2"
            value={newItemName} 
            onChangeText={setNewItemName}
            autoFocus
          />
          <View style={styles.formBtns}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsAdding(false)}>
              <Text style={{ color: '#7f8c8d', fontWeight: '600' }}>Скасувати</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleAddDirectly}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Додати</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity style={styles.openFormBtn} onPress={() => setIsAdding(true)}>
          <Ionicons name="add-circle" size={24} color="#3498db" />
          <Text style={styles.openFormText}>Додати в кошик вручну</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={meds}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.photo ? (
              <Image source={{ uri: item.photo }} style={styles.photo} />
            ) : (
              <View style={styles.iconPlaceholder}>
                <Ionicons name="medkit" size={20} color="#bdc3c7" />
              </View>
            )}
            <Text style={styles.name}>{item.name}</Text>
            
            <View style={styles.actions}>
              {/* Кнопка "Куплено" (повернути на головну) */}
              <TouchableOpacity onPress={() => handleMoveToMain(item.id)} style={styles.actionBtn}>
                <Ionicons name="checkmark-circle" size={28} color="#2ecc71" />
              </TouchableOpacity>
              
              {/* Кнопка "Видалити назавжди" */}
              <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
                <Ionicons name="trash" size={22} color="#e74c3c" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="cart-outline" size={60} color="#bdc3c7" />
            <Text style={styles.emptyText}>Кошик порожній</Text>
            <Text style={styles.emptySubText}>Додайте ліки з головного екрану або вручну</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa', padding: 15 },
  header: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50', marginBottom: 15 },
  
  addForm: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15 },
  input: { borderBottomWidth: 1, borderBottomColor: '#bdc3c7', padding: 10, fontSize: 16, marginBottom: 10, color: '#2c3e50' },
  formBtns: { flexDirection: 'row', justifyContent: 'flex-end', gap: 15 },
  cancelBtn: { padding: 10 },
  saveBtn: { backgroundColor: '#3498db', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  
  openFormBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, padding: 5 },
  openFormText: { color: '#3498db', fontSize: 16, fontWeight: '600', marginLeft: 5 },

  card: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 10, alignItems: 'center' },
  photo: { width: 40, height: 40, borderRadius: 6, marginRight: 10 },
  iconPlaceholder: { width: 40, height: 40, borderRadius: 6, backgroundColor: '#ecf0f1', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  name: { flex: 1, fontSize: 16, color: '#34495e', fontWeight: '500' },
  
  actions: { flexDirection: 'row', gap: 10 },
  actionBtn: { padding: 5 },
  
  empty: { alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#7f8c8d', marginTop: 10 },
  emptySubText: { color: '#95a5a6', marginTop: 5, textAlign: 'center' }
});