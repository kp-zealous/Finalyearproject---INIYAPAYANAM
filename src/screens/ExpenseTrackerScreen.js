import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Button, FlatList, Alert,
  StyleSheet, KeyboardAvoidingView, Platform,
  TouchableWithoutFeedback, Keyboard, TouchableOpacity
} from 'react-native';
import { db } from '../config/firebase';
import {
  collection, addDoc, onSnapshot, query, orderBy, where
} from 'firebase/firestore';
import { doc, deleteDoc } from 'firebase/firestore';

import { getAuth } from 'firebase/auth';

export default function ExpenseTrackerScreen({ navigation,route  }) {
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [expenses, setExpenses] = useState([]);

  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [userId, setUserId] = useState(null);
  const preselectedTripId = route?.params?.tripId || null;
  const preselectedUserId = route?.params?.userId || null;


  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) return;
    const uid = preselectedUserId || user.uid;


    setUserId(uid);

    const tripsQuery = query(
      collection(db, 'trips'),
      where('userId', '==', user.uid),
      orderBy('startDate', 'desc')
    );

    const unsubscribeTrips = onSnapshot(tripsQuery, (snapshot) => {
      const tripsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTrips(tripsData);
      if (preselectedTripId) {
        setSelectedTripId(preselectedTripId);
      }

    });

    return () => unsubscribeTrips();
  }, []);

  useEffect(() => {
    if (!selectedTripId || !userId) return;
  
    const expensesRef = collection(
      db,
      'users',
      userId,
      'trips',
      selectedTripId,
      'expenses'
    );
  
    const q = query(expensesRef, orderBy('createdAt', 'desc'));
  
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setExpenses(data);
    });
  
    return () => unsubscribe();
  }, [selectedTripId, userId]);
  
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
      const expenseRef = collection(
        db,
        'users',
        userId,
        'trips',
        selectedTripId,
        'expenses'
      );
  
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
      await deleteDoc(
        doc(db, 'users', userId, 'trips', selectedTripId, 'expenses', expenseId)
      );
    } catch (error) {
      console.error('Error deleting expense:', error);
      Alert.alert('Error', 'Could not delete expense.');
    }
  };
  
  
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const formatDate = (date) => {
    if (!date?.toDate) return '';
    const d = date.toDate();
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Text style={styles.title}>💰 Expense Tracker</Text>

        <Text style={styles.sectionTitle}>Select a Trip</Text>
        <FlatList
          horizontal
          data={trips}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.tripCard,
                item.id === selectedTripId && styles.tripCardSelected,
              ]}
              onPress={() => setSelectedTripId(item.id)}
            >
              <Text style={styles.tripName}>{item.destination}</Text>
              <Text style={styles.date}>
                {formatDate(item.startDate)} → {formatDate(item.endDate)}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text>No trips found.</Text>}
          style={{ marginBottom: 15 }}
        />

        {selectedTripId && (
          <>
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
                  <View>                  
                  <Text style={styles.expenseText}>{item.category}</Text>
                  <Text style={styles.expenseAmount}>₹{item.amount.toFixed(2)}</Text>
                  </View>
                  <TouchableOpacity onPress={() => deleteExpense(item.id)}>
        <Text style={styles.deleteIcon}>❌</Text>
      </TouchableOpacity>

                </View>
              )}
            />
          </>
        )}
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#334155',
  },
  tripCard: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#e2e8f0',
    marginRight: 12,
    minWidth: 120,
  },
  tripCardSelected: {
    backgroundColor: '#2563eb',
  },
  tripName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#f1f5f9',
  },
  inputContainer: {
    marginBottom: 24,
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 10,
    elevation: 2,
  },
  input: {
    borderColor: '#cbd5e1',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#ffffff',
    fontSize: 16,
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
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  expenseText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16a34a',
    marginTop: 4,
  },
  deleteIcon: {
    fontSize: 20,
    color: '#ef4444',
    padding: 6,
  },
});
