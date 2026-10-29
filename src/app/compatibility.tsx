import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function CompatibilityScreen() {
  const [meds, setMeds] = useState<string[]>(['', '']);
  const [result, setResult] = useState<null | { status: 'ok' | 'warning' | 'danger', text: string }>(null);

 
  const addField = () => {
    setMeds([...meds, '']);
  };

  // Оновити конкретне поле
  const updateMed = (text: string, index: number) => {
    const newMeds = [...meds];
    newMeds[index] = text;
    setMeds(newMeds);
  };

  // Видалити поле
  const removeField = (index: number) => {
    if (meds.length <= 2) {
      Alert.alert("Помилка", "Потрібно мінімум 2 препарати для перевірки");
      return;
    }
    const newMeds = meds.filter((_, i) => i !== index);
    setMeds(newMeds);
  };

  const checkCompatibility = () => {
    const filledMeds = meds.filter(m => m.trim() !== '').map(m => m.toLowerCase());
    
    if (filledMeds.length < 2) {
      Alert.alert("Увага", "Введіть назви хоча б двох препаратів");
      return;
    }

    // Імітація логіки перевірки
    if (filledMeds.includes('аспірин') && filledMeds.includes('ібупрофен')) {
      setResult({ status: 'danger', text: 'Небезпечно! Аспірин + Ібупрофен: підвищений ризик кровотечі.' });
    } else if (filledMeds.filter(m => m.includes('парацетамол')).length > 1) {
      setResult({ status: 'danger', text: 'Небезпечно! Подвійна доза Парацетамолу: ризик для печінки.' });
    } else if (filledMeds.some(m => m.includes('антибіотик'))) {
      setResult({ status: 'warning', text: 'Обережно! Антибіотики можуть знижувати ефект інших ліків.' });
    } else {
      setResult({ status: 'ok', text: 'Явних конфліктів не виявлено. Але проконсультуйтеся з лікарем.' });
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.desc}>Введіть назви препаратів, щоб перевірити їх взаємодію.</Text>
      
      {meds.map((med, index) => (
        <View key={index} style={styles.inputRow}>
          <TextInput 
            style={[styles.input, { flex: 1 }]} 
            placeholder={`Препарат ${index + 1}`} 
            value={med} 
            onChangeText={(text) => updateMed(text, index)} 
          />
          {meds.length > 2 && (
            <TouchableOpacity onPress={() => removeField(index)} style={styles.removeBtn}>
              <Ionicons name="close-circle" size={24} color="#e74c3c" />
            </TouchableOpacity>
          )}
        </View>
      ))}

      <TouchableOpacity style={styles.addBtn} onPress={addField}>
        <Ionicons name="add-circle-outline" size={20} color="#3498db" />
        <Text style={styles.addBtnText}>Додати ще препарат</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={checkCompatibility}>
        <Text style={styles.btnText}>Перевірити сумісність</Text>
      </TouchableOpacity>

      {result && (
        <View style={[
          styles.resultBox, 
          result.status === 'danger' ? styles.dangerBox : 
          result.status === 'warning' ? styles.warningBox : styles.okBox
        ]}>
          <Ionicons 
            name={result.status === 'ok' ? "checkmark-circle" : "alert-circle"} 
            size={30} 
            color={result.status === 'ok' ? "#27ae60" : result.status === 'warning' ? "#f39c12" : "#e74c3c"} 
          />
          <Text style={styles.resultText}>{result.text}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  desc: { fontSize: 15, color: '#7f8c8d', marginBottom: 20, textAlign: 'center' },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9'
  },
  removeBtn: { marginLeft: 10 },
  addBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginVertical: 10 },
  addBtnText: { color: '#3498db', fontSize: 16, fontWeight: '600', marginLeft: 5 },
  btn: {
    backgroundColor: '#8e44ad',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10
  },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  resultBox: {
    marginTop: 20,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1
  },
  okBox: { backgroundColor: '#eafaf1', borderColor: '#2ecc71' },
  warningBox: { backgroundColor: '#fef9e7', borderColor: '#f1c40f' },
  dangerBox: { backgroundColor: '#fdedec', borderColor: '#e74c3c' },
  resultText: { marginTop: 10, fontSize: 15, textAlign: 'center', color: '#2c3e50', fontWeight: '500' }
});