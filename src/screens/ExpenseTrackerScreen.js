import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { db } from '../config/firebase';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';

export default function ExpenseTrackerScreen() {
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'expenses'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setExpenses(data);
    });

    return () => unsubscribe();
  }, []);

  const addExpense = async () => {
    if (!category.trim() || !amount.trim()) {
      Alert.alert('Missing Fields', 'Please enter both category and amount.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive number.');
      return;
    }

    try {
      await addDoc(collection(db, 'expenses'), {
        category: category.trim(),
        amount: parsedAmount,
        createdAt: new Date(),
      });

      setCategory('');
      setAmount('');
    } catch (error) {
      console.error('Error adding expense:', error);
      Alert.alert('Error', 'Could not add expense. Please try again.');
    }
  };

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Text style={styles.title}>💰 Expense Tracker</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Category (e.g. Food, Transport)"
            value={category}
            onChangeText={setCategory}
          />
          <TextInput
            style={styles.input}
            placeholder="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
          <Button title="Add Expense" onPress={addExpense} />
        </View>

        <Text style={styles.total}>Total Spent: ₹{total.toFixed(2)}</Text>

        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.expenseItem}>
              <Text style={styles.expenseText}>{item.category}</Text>
              <Text style={styles.expenseAmount}>₹{item.amount.toFixed(2)}</Text>
            </View>
          )}
        />
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f7fa',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  total: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#444',
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  expenseText: {
    fontSize: 16,
    fontWeight: '500',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4caf50',
  },
});
