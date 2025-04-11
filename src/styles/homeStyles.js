import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E9F5F9', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 36, fontWeight: '800', color: '#005F73', marginBottom: 10 },
  sub: { fontSize: 16, color: '#333', marginBottom: 30 },
  button: {
    backgroundColor: '#0A9396',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginBottom: 20,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginBottom: 20,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  buttonTextDisabled: { color: '#777', fontWeight: 'bold', fontSize: 16 },
  userText: {
    fontSize: 16,
    marginBottom: 15,
    color: '#555',
    textAlign: 'center',
  },
  
});

