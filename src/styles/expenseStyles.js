import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0EFEB', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#005F73', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#94D2BD',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  total: { fontSize: 18, fontWeight: 'bold', marginVertical: 10, color: '#0A9396' },
  expenseItem: {
    backgroundColor: '#E9F5F9',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderLeftWidth: 5,
    borderLeftColor: '#0A9396',
  },
  expenseText: { fontSize: 16, color: '#333' },
  expenseAmount: { fontSize: 16, fontWeight: 'bold', color: '#005F73' },
});
