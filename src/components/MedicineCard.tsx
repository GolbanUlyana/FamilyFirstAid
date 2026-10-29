import { Ionicons } from '@expo/vector-icons';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Medicine } from '../utils/storage';

interface Props {
  item: Medicine;
  onDelete: (id: string) => void;
  onMoveToShopping: (id: string) => void;
}

export default function MedicineCard({ item, onDelete, onMoveToShopping }: Props) {
  const isExpiringSoon = () => {
    if (!item.expiryDate) return false;
    const [year, month] = item.expiryDate.split('-').map(Number);
    const expDate = new Date(year, month, 0);
    const today = new Date();
    const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  };

  const confirmDelete = () => {
    Alert.alert("Видалити ліки?", "Це видалить ліки з вашої аптечки.", [
      { text: "Скасувати", style: "cancel" },
      { text: "Видалити", style: "destructive", onPress: () => onDelete(item.id) }
    ]);
  };

  return (
    <View style={[styles.card, isExpiringSoon() && styles.expiringCard]}>
      {item.photo ? (
        <Image source={{ uri: item.photo }} style={styles.photo} />
      ) : (
        <View style={styles.iconContainer}>
          <Ionicons name="medkit" size={24} color="#2c3e50" />
        </View>
      )}
      
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.dosage}>{item.dosage}</Text>
        <View style={styles.detailsRow}>
          <Text style={[styles.detailsText, isExpiringSoon() && { color: '#e74c3c', fontWeight: 'bold' }]}>
            📅 до {item.expiryDate || '—'}
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => onMoveToShopping(item.id)} style={styles.actionBtn}>
          <Ionicons name="cart" size={20} color="#f39c12" />
        </TouchableOpacity>
        <TouchableOpacity onPress={confirmDelete} style={styles.actionBtn}>
          <Ionicons name="trash" size={20} color="#e74c3c" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db'
  },
  expiringCard: {
    borderLeftColor: '#e74c3c',
    backgroundColor: '#fff5f5'
  },
  photo: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 15,
    backgroundColor: '#ecf0f1'
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#ecf0f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50' },
  dosage: { fontSize: 13, color: '#7f8c8d', marginTop: 2 },
  detailsRow: { flexDirection: 'row', marginTop: 6, gap: 15 },
  detailsText: { fontSize: 12, color: '#34495e' },
  actions: { flexDirection: 'column', gap: 10 },
  actionBtn: { padding: 5 }
});