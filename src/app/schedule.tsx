import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getMedicines, getSchedule, Medicine, saveSchedule, ScheduleItem } from '../utils/storage';

const DAYS_OF_WEEK = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

export default function ScheduleScreen() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [meds, setMeds] = useState<Medicine[]>([]);
  
  // Стан для перемикання вкладок: 'today' або 'all'
  const [activeTab, setActiveTab] = useState<'today' | 'all'>('today');

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMed, setSelectedMed] = useState<Medicine | null>(null);
  const [times, setTimes] = useState<string[]>(['']); 
  const [selectedDays, setSelectedDays] = useState<number[]>([]); 
  const [endDate, setEndDate] = useState(''); 
  const [errorMsg, setErrorMsg] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const schData = await getSchedule();
    setSchedule(schData);
    const medsData = await getMedicines();
    setMeds(medsData);
  };

  const addTimeField = () => setTimes([...times, '']);
  const updateTime = (text: string, index: number) => {
    const newTimes = [...times];
    newTimes[index] = text;
    setTimes(newTimes);
    setErrorMsg('');
  };
  const removeTimeField = (index: number) => {
    if (times.length <= 1) return; 
    setTimes(times.filter((_, i) => i !== index));
  };

  const toggleDay = (dayIndex: number) => {
    if (selectedDays.includes(dayIndex)) {
      setSelectedDays(selectedDays.filter(d => d !== dayIndex));
    } else {
      setSelectedDays([...selectedDays, dayIndex]);
    }
  };

  const handleAddSchedule = async () => {
    setErrorMsg('');

    if (!selectedMed) {
      setErrorMsg('Оберіть ліки!');
      return;
    }
    
    const validTimes = times.map(t => t.trim()).filter(t => t !== '');
    if (validTimes.length === 0) {
      setErrorMsg('Введіть час прийому!');
      return;
    }
    
    try {
      const newItem: ScheduleItem = {
        id: Date.now().toString(),
        medicineId: selectedMed.id,
        medicineName: selectedMed.name,
        times: validTimes, 
        days: selectedDays,
        endDate: endDate.trim(),
      };
      
      const updated = [...schedule, newItem];
      await saveSchedule(updated);
      setSchedule(updated);
      closeModal();
    } catch (error: any) {
      setErrorMsg('Помилка: ' + error.message);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedMed(null);
    setTimes(['']); 
    setSelectedDays([]);
    setEndDate('');
    setErrorMsg('');
  };

  const handleDelete = async (id: string) => {
    try {
      const updated = schedule.filter(s => s.id !== id);
      setSchedule(updated);
      await saveSchedule(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const isActiveToday = (item: ScheduleItem) => {
    const today = new Date();
    const todayDay = today.getDay();

    if (item.days && item.days.length > 0 && !item.days.includes(todayDay)) return false;
    if (item.endDate) {
      const [y, m, d] = item.endDate.split('-').map(Number);
      const end = new Date(y, m - 1, d);
      end.setHours(23, 59, 59);
      if (today > end) return false;
    }
    return true;
  };

  // Фільтруємо дані залежно від вкладки
  const displayedData = activeTab === 'today' ? schedule.filter(isActiveToday) : schedule;

  return (
    <View style={styles.container}>
      {/* Перемикач вкладок */}
      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'today' && styles.activeTab]} 
          onPress={() => setActiveTab('today')}
        >
          <Text style={[styles.tabText, activeTab === 'today' && styles.activeTabText]}>На сьогодні</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'all' && styles.activeTab]} 
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>Всі призначення</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={displayedData}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.scheduleCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.name}>{item.medicineName}</Text>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Ionicons name="close-circle" size={24} color="#e74c3c" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.timesRow}>
              {item.times.map((t, i) => (
                <View key={i} style={styles.timeBadge}>
                  <Text style={styles.timeText}>{t}</Text>
                </View>
              ))}
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.metaText}>
                {!item.days || item.days.length === 0 ? 'Щодня' : item.days.map(d => DAYS_OF_WEEK[d]).join(', ')}
              </Text>
              <Text style={styles.metaText}>
                {item.endDate ? `до ${item.endDate}` : 'Постійно'}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="time-outline" size={60} color="#bdc3c7" />
            <Text style={styles.emptyText}>
              {activeTab === 'today' ? 'Немає прийомів на сьогодні' : 'Список порожній'}
            </Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Новий прийом</Text>
              
              {errorMsg ? <View style={styles.errorBox}><Text style={styles.errorText}>{errorMsg}</Text></View> : null}

              <Text style={styles.label}>1. Оберіть ліки:</Text>
              <View style={styles.medsList}>
                {meds.map(m => (
                  <TouchableOpacity 
                    key={m.id} 
                    style={[styles.medOption, selectedMed?.id === m.id && styles.medOptionSelected]}
                    onPress={() => { setSelectedMed(m); setErrorMsg(''); }}
                  >
                    <Text style={{color: selectedMed?.id === m.id ? '#fff' : '#2c3e50'}}>{m.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>2. Час прийому:</Text>
              {times.map((t, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <TextInput 
                    style={[styles.input, { flex: 1, marginBottom: 0 }]} 
                    placeholder="Напр. 08:00" 
                    placeholderTextColor="#a0aab2"
                    value={t} 
                    onChangeText={(text) => updateTime(text, i)} 
                  />
                  {times.length > 1 && (
                    <TouchableOpacity onPress={() => removeTimeField(i)} style={{ marginLeft: 10 }}>
                      <Ionicons name="remove-circle" size={28} color="#e74c3c" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              
              <TouchableOpacity style={styles.addTimeBtn} onPress={addTimeField}>
                <Ionicons name="add" size={20} color="#3498db" />
                <Text style={{ color: '#3498db', fontWeight: '600' }}>Додати ще час</Text>
              </TouchableOpacity>

              <Text style={styles.label}>3. Дні тижня (або щодня):</Text>
              <View style={styles.daysRow}>
                {DAYS_OF_WEEK.map((day, index) => (
                  <TouchableOpacity 
                    key={index}
                    style={[styles.dayBtn, selectedDays.includes(index) && styles.dayBtnActive]}
                    onPress={() => toggleDay(index)}
                  >
                    <Text style={{ color: selectedDays.includes(index) ? '#fff' : '#2c3e50', fontWeight: 'bold' }}>{day}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>4. Курс до (РРРР-ММ-ДД):</Text>
              <TextInput 
                style={styles.input} 
                placeholder="2025-12-31 (або пусто)" 
                placeholderTextColor="#a0aab2"
                value={endDate} 
                onChangeText={setEndDate} 
              />

              <View style={styles.modalBtns}>
                <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
                  <Text style={{ color: '#7f8c8d', fontWeight: 'bold' }}>Скасувати</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.addBtn} onPress={handleAddSchedule}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Зберегти</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa', padding: 15 },
  
  tabs: { flexDirection: 'row', backgroundColor: '#e0e6ed', borderRadius: 10, padding: 4, marginBottom: 15 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  tabText: { fontWeight: '600', color: '#7f8c8d' },
  activeTabText: { color: '#2c3e50' },

  scheduleCard: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50' },
  timesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  timeBadge: { backgroundColor: '#3498db', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  timeText: { color: '#fff', fontWeight: 'bold' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#ecf0f1', paddingTop: 8 },
  metaText: { fontSize: 12, color: '#7f8c8d', fontWeight: '500' },
  
  empty: { alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#7f8c8d', marginTop: 10 },
  fab: { position: 'absolute', bottom: 30, right: 30, backgroundColor: '#27ae60', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 15 },
  modalContent: { backgroundColor: '#fff', borderRadius: 15, padding: 20, maxHeight: '90%' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#2c3e50', marginBottom: 15, textAlign: 'center' },
  errorBox: { backgroundColor: '#fdedec', padding: 10, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#e74c3c' },
  errorText: { color: '#e74c3c', fontWeight: 'bold', textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '700', color: '#34495e', marginTop: 15, marginBottom: 8 },
  medsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  medOption: { paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: '#bdc3c7', borderRadius: 8 },
  medOptionSelected: { backgroundColor: '#3498db', borderColor: '#3498db' },
  input: { borderWidth: 1, borderColor: '#bdc3c7', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 8, backgroundColor: '#f9f9f9' },
  addTimeBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  daysRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  dayBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ecf0f1', justifyContent: 'center', alignItems: 'center' },
  dayBtnActive: { backgroundColor: '#3498db' },
  modalBtns: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, marginBottom: 10 },
  cancelBtn: { padding: 15 },
  addBtn: { backgroundColor: '#27ae60', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 8 }
});