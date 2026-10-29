import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getMedicines, Medicine, saveMedicines } from '../utils/storage';

export default function HomeScreen() {
  const [meds, setMeds] = useState<Medicine[]>([]);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      loadMeds();
    }, [])
  );

  const loadMeds = async () => {
    const data = await getMedicines();
    setMeds(data);
  };

  const handleDelete = async (id: string) => {
    try {
      const updated = meds.filter(m => m.id !== id);
      setMeds(updated);
      await saveMedicines(updated);
    } catch (e) { alert("Помилка"); }
  };

  const handleMoveToShopping = async (id: string) => {
    const newMeds = meds.map(m => m.id === id ? { ...m, isInShoppingList: true } : m);
    setMeds(newMeds);
    await saveMedicines(newMeds);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerButtons}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/schedule')}>
          <Ionicons name="time-outline" size={20} color="#fff" />
          <Text style={styles.navBtnText}>Прийом</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/shopping')}>
          <Ionicons name="cart-outline" size={20} color="#fff" />
          <Text style={styles.navBtnText}>Кошик</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/compatibility')}>
          <Ionicons name="flask-outline" size={20} color="#fff" />
          <Text style={styles.navBtnText}>Сумісність</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Мої ліки ({meds.length})</Text>

      <FlatList
        data={meds}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.photo ? <Image source={{ uri: item.photo }} style={styles.photo} /> : 
            <View style={styles.iconPlaceholder}><Ionicons name="medkit" size={20} color="#bdc3c7" /></View>}
            
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.dosage}>{item.dosage}</Text>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity 
                onPress={() => router.push({ 
                  pathname: '/edit', 
                  params: { id: item.id, name: item.name, dosage: item.dosage, expiryDate: item.expiryDate } 
                })} 
                style={styles.actionBtn}
              >
                <Ionicons name="pencil" size={20} color="#3498db" />
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => handleMoveToShopping(item.id)} style={styles.actionBtn}>
                <Ionicons name="cart" size={20} color="#f39c12" />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
                <Ionicons name="trash" size={20} color="#e74c3c" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="medkit-outline" size={60} color="#bdc3c7" />
            <Text style={styles.emptyText}>Аптечка порожня</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/add')}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa', padding: 15 },
  headerButtons: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  navBtn: { flex: 1, flexDirection: 'row', backgroundColor: '#34495e', padding: 10, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginHorizontal: 3, gap: 5 },
  navBtnText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50', marginBottom: 10 },
  card: { flexDirection: 'row', backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 10, alignItems: 'center' },
  photo: { width: 50, height: 50, borderRadius: 8, marginRight: 10 },
  iconPlaceholder: { width: 50, height: 50, borderRadius: 8, backgroundColor: '#ecf0f1', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50' },
  dosage: { fontSize: 13, color: '#7f8c8d', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 5 },
  actionBtn: { padding: 5 },
  empty: { alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#7f8c8d', marginTop: 10 },
  fab: { position: 'absolute', bottom: 30, right: 30, backgroundColor: '#3498db', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 }
});