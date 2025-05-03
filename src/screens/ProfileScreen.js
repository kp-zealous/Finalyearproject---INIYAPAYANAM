import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Image, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db, storage } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { pickImage } from '../helpers/ImageHelper';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import Header from '../components/Header';
import Navbar from '../components/Navbar';

const defaultProfilePic = 'https://i.pravatar.cc/100';

const ProfileScreen = () => {
  const [user, setUser] = useState(null);
  const [profilePic, setProfilePic] = useState(defaultProfilePic);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const userRef = user ? doc(db, 'users', user.uid) : null;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setName(currentUser.displayName || '');
        setEmail(currentUser.email || '');
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) return;

    const loadUserData = async () => {
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfilePic(data.profilePic || defaultProfilePic);
        setFeedback(data.feedback || '');
        setPhone(data.phone || '');
      }
    };
    loadUserData();
  }, [user]);

  const openModal = (type) => {
    setModalType(type);
    setModalVisible(true);
  };

  const saveToFirebase = async (fields) => {
    await setDoc(userRef, fields, { merge: true });
  };

  const handleImageUpload = async () => {
    const image = await pickImage();
    if (!image?.uri) return;
    
    // Display loading indicator during image upload
    setLoading(true);

    try {
      const imageRef = ref(storage, `profiles/${user.uid}`);
      const img = await fetch(image.uri);
      const blob = await img.blob();
      await uploadBytes(imageRef, blob);

      const url = await getDownloadURL(imageRef);
      await saveToFirebase({ profilePic: url });
      setProfilePic(url);
    } catch (error) {
      console.error('Image upload failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePic = async () => {
    const imageRef = ref(storage, `profiles/${user.uid}`);

    // Display loading indicator during image removal
    setLoading(true);

    try {
      await deleteObject(imageRef);
      await saveToFirebase({ profilePic: '' });
      setProfilePic(defaultProfilePic);
    } catch (error) {
      console.error('Image removal failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const payload = {};
    if (modalType === 'name') {
      await updateProfile(auth.currentUser, { displayName: name });
      payload.displayName = name;
    } else if (modalType === 'feedback') {
      payload.feedback = feedback;
    } else if (modalType === 'phone') {
      payload.phone = phone;
    }

    await saveToFirebase(payload);
    setModalVisible(false);
  };

  if (loading) return <ActivityIndicator size="large" />;

  return (
    <>
    <Header/>
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={handleImageUpload} style={styles.avatarContainer}>
        <Image source={{ uri: profilePic }} style={styles.avatar} />
        <Text style={styles.changePic}>Change Photo</Text>
      </TouchableOpacity>

      <View style={styles.row}>
        <Text style={styles.label}>Name</Text>
        <View style={styles.rowRight}>
          <Text style={styles.text}>{name || 'No name set'}</Text>
          <Ionicons name="create-outline" size={20} onPress={() => openModal('name')} />
        </View>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Email</Text>
        <View style={styles.rowRight}>
          <Text style={styles.text}>{email}</Text>
          <Ionicons name="mail-outline" size={20} />
        </View>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Phone</Text>
        <View style={styles.rowRight}>
          <Text style={styles.text}>{phone || 'Not set'}</Text>
          <Ionicons name="call-outline" size={20} onPress={() => openModal('phone')} />
        </View>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Feedback</Text>
        <View style={styles.rowRight}>
          <Text style={styles.text} numberOfLines={1}>{feedback || 'No feedback given'}</Text>
          <Ionicons name="chatbubble-ellipses-outline" size={20} onPress={() => openModal('feedback')} />
        </View>
      </View>

      {/* Modal */}
      <Modal transparent visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {modalType === 'name' && 'Edit Name'}
              {modalType === 'feedback' && 'Edit Feedback'}
              {modalType === 'phone' && 'Edit Phone'}
            </Text>

            {modalType === 'name' && (
              <TextInput style={styles.input} value={name} onChangeText={setName} />
            )}

            {modalType === 'feedback' && (
              <TextInput
                style={[styles.input, { height: 100 }]}
                multiline
                value={feedback}
                onChangeText={setFeedback}
                placeholder="Your feedback..."
              />
            )}

            {modalType === 'phone' && (
              <TextInput
                style={styles.input}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={handleSave}>
                <Text style={styles.saveBtn}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtn}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
    <Navbar/>
    </>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 60, backgroundColor: '#f8f8f8' },
  avatarContainer: { alignItems: 'center', marginVertical: 15 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  changePic: { color: '#007bff', marginTop: 8, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: { fontWeight: 'bold', fontSize: 16 },
  text: { fontSize: 15, maxWidth: 200 },
  modalBackdrop: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContainer: {
    width: 320, backgroundColor: '#fff', borderRadius: 12,
    padding: 20, elevation: 5,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 10, marginBottom: 15, backgroundColor: '#fefefe',
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 20 },
  saveBtn: { color: '#007bff', fontWeight: 'bold' },
  cancelBtn: { color: 'gray' },
});

export default ProfileScreen;
