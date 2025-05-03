// ExpenseDetailScreen
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { db } from '../config/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { PDFDocument, PDFPage } from 'react-native-pdf-lib';

export default function ExpenseDetailScreen({ route, navigation }) {
  const { tripId } = route.params;
  const [expenses, setExpenses] = useState([]);
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) return;
    const uid = user.uid;
    setUserId(uid);

    const expensesRef = collection(db, 'users', uid, 'trips', tripId, 'expenses');
    const expensesQuery = query(expensesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(expensesQuery, (snapshot) => {
      const expensesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setExpenses(expensesData);
    });

    return () => unsubscribe();
  }, [tripId]);

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
      const expenseRef = collection(db, 'users', userId, 'trips', tripId, 'expenses');
      await addDoc(expenseRef, {
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

  const deleteExpense = async (expenseId) => {
    try {
      await deleteDoc(doc(db, 'users', userId, 'trips', tripId, 'expenses', expenseId));
    } catch (error) {
      console.error('Error deleting expense:', error);
      Alert.alert('Error', 'Could not delete expense.');
    }
  };

  const generatePdf = async () => {
    try {
      const doc = await PDFDocument.create();
      const page = doc.addPage([600, 800]);

      page.drawText('Expense Tracker Report', { x: 50, y: 750 });

      expenses.forEach((expense, index) => {
        page.drawText(`${expense.category}: ₹${expense.amount.toFixed(2)}`, {
          x: 50,
          y: 720 - index * 20,
        });
      });

      const path = await doc.write();
      console.log('PDF Path:', path);

      // Logic to download or share the PDF (you can use a library like react-native-share here)
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Expenses for Trip</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Category"
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

      <Text style={styles.total}>Total: ₹{total.toFixed(2)}</Text>

      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.expenseItem}>
            <Text style={styles.expenseText}>{item.category}</Text>
            <Text style={styles.expenseAmount}>₹{item.amount.toFixed(2)}</Text>
            <TouchableOpacity onPress={() => deleteExpense(item.id)}>
              <Text style={styles.deleteIcon}>❌</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Button title="Download Expense Tracker" onPress={generatePdf} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 25,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 24,
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 10,
  },
  input: {
    borderColor: '#cbd5e1',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 18,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    marginBottom: 12,
  },
  expenseText: {
    fontSize: 16,
    fontWeight: '500',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16a34a',
  },
  deleteIcon: {
    fontSize: 20,
    color: '#ef4444',
    padding: 6,
  },
});
