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
import { jsPDF } from 'jspdf';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { ScrollView } from 'react-native';



const categories = ['Food', 'Hotel', 'Travel', 'Miscellaneous', 'Shopping', 'Medical'];

export default function ExpenseTrackerScreen({ navigation, route }) {
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseName, setExpenseName] = useState('');
  const [userId, setUserId] = useState(null);
  const [budget, setBudget] = useState(0);

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

    const tripRef = doc(db, 'trips', selectedTripId);
    const tripSnap = onSnapshot(tripRef, (doc) => {
      setBudget(doc.data()?.budget || 0);
    });

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

    return () => {
      tripSnap();
      unsubscribe();
    };
  }, [selectedTripId, userId]);

  const addExpense = async () => {
    if (!category.trim() || !amount.trim() || !expenseName.trim()) {
      Alert.alert('Missing Fields', 'Please enter all fields.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive number.');
      return;
    }

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    if (totalSpent + parsedAmount > budget) {
      Alert.alert('Budget Exceeded', 'You have exceeded the budget for this trip!');
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
        expenseName: expenseName.trim(),
        createdAt: new Date(),
      });

      setCategory('');
      setAmount('');
      setExpenseName('');
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

  const generatePDF = async () => {
    console.log('expense:',expenses[0].amount);
    try{
    let htmlContent = `
    <html>
      <head>
        <style>
          @page {
            margin: 30px;
          }
          body {
            font-family: Arial, sans-serif;
            background-color: #FAFAFA;
            padding: 20px;
            color: #333;
          }
          .heading {
            font-size: 22px;
            font-weight: bold;
            color: #007AFF;
            text-align: center;
            margin-bottom: 10px;
          }
          .subheading {
            text-align: center;
            font-size: 16px;
            color: #555;
            margin-bottom: 30px;
          }
          .summary-block {
            background-color: #e6f0ff;
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 20px;
          }
          .summary-item {
            font-size: 16px;
            margin: 5px 0;
            font-weight: 500;
          }
          .expense-card {
            background-color: #ffffff;
            border: 1px solid #ccc;
            border-left: 4px solid #007AFF;
            border-radius: 8px;
            padding: 10px 15px;
            margin-bottom: 15px;
          }
          .expense-title {
            font-weight: bold;
            font-size: 15px;
            margin-bottom: 5px;
            color: #333;
          }
          .expense-details {
            font-size: 14px;
            color: #555;
            margin-left: 10px;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-style: italic;
            font-size: 13px;
            color: #888;
            border-top: 1px solid #ccc;
            padding-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="heading">Expense Tracker - Trip Summary</div>
        <div class="subheading">Managed by IniyaPayanam 💼</div>
    
        <div class="summary-block">
          <div class="summary-item">💰 Trip Budget: ₹${budget}</div>
          <div class="summary-item">🧾 Total Spent: ₹${expenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}</div>
        </div>
    `;
    
    expenses.forEach((expense) => {
      htmlContent += `
        <div class="expense-card">
          <div class="expense-title">📌 ${expense.expenseName}</div>
          <div class="expense-details">📂 Category: ${expense.category}</div>
          <div class="expense-details">💵 Amount: ₹${expense.amount.toFixed(2)}</div>
        </div>
      `;
    });
    
    htmlContent += `
        <div class="footer">PDF generated by IniyaPayanam ✈️</div>
      </body>
    </html>
    `;
    
      console.log("genrated pdf")

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Sharing Unavailable', 'Cannot share the PDF on this device.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
      console.error(error);
    }
      };
  
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };


  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollViewContent}>
              
   
      <View>


        <Text style={styles.title}>💰 Expense Tracker</Text>

        <Text style={styles.sectionTitle}>Select a Trip</Text>
        <View style={{ flexDirection: 'row', marginBottom: 15 }}>
  {trips.length > 0 ? (
    trips.map((item) => (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.tripCard,
          item.id === selectedTripId && styles.tripCardSelected,
        ]}
        onPress={() => setSelectedTripId(item.id)}
      >
        <Text style={styles.tripName}>{item.tripName}</Text>
        <Text style={styles.date}>
        {formatDate(item.startDate)} → {formatDate(item.endDate)}
        </Text>
      </TouchableOpacity>
    ))
  ) : (
    <Text>No trips found.</Text>
  )}
</View>
        {selectedTripId && (
          <>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Expense Name"
                value={expenseName}
                onChangeText={setExpenseName}
              />
              <TextInput
                style={styles.input}
                placeholder="Amount"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />
              <View style={styles.categoryContainer}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.categoryTile, category === cat && styles.categorySelected]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text style={styles.categoryText}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Button title="Add Expense" onPress={addExpense} />
            </View>

            <Text style={styles.total}>Total Spent: ₹{total.toFixed(2)}</Text>
            <Text style={styles.total}>Remaining Budget: ₹{(budget - total).toFixed(2)}</Text>

            {total > budget && (
              <Text style={styles.alert}>🚨 You have exceeded your budget!</Text>
            )}

{expenses.map((item) => (
  <View key={item.id} style={styles.expenseItem}>
    <View>
      <Text style={styles.expenseText}>{item.expenseName}</Text>
      <Text style={styles.expenseCategory}>{item.category}</Text>
      <Text style={styles.expenseAmount}>₹{item.amount.toFixed(2)}</Text>
    </View>
    <TouchableOpacity onPress={() => deleteExpense(item.id)}>
      <Text style={styles.deleteIcon}>❌</Text>
    </TouchableOpacity>
  </View>
))}

            <Button title="Download PDF" onPress={generatePDF} style={{marginBottom:10}}/>
          </>
        )}
            </View>
                    </ScrollView>


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9fafb',
  },
  scrollViewContent: {
    paddingBottom: 80, 
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
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  categoryTile: {
    backgroundColor: '#d1d5db',
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  categorySelected: {
    backgroundColor: '#2563eb',
  },
  categoryText: {
    color: '#ffffff',
    fontSize: 14,
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 18,
  },
  alert: {
    color: 'red',
    fontSize: 16,
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
  expenseCategory: {
    fontSize: 14,
    color: '#6b7280',
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
