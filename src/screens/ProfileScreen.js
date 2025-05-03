// ProfileScreen.js

import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Image, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db, storage } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { pickImage } from '../helpers/ImageHelper';
import { onAuthStateChanged, updateProfile, signOut } from 'firebase/auth';
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
  const [rating, setRating] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

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
    setFeedbackSubmitted(false);
    setFeedbackText('');
    setRating(null);
    setModalVisible(true);
  };

  const saveToFirebase = async (fields) => {
    await setDoc(userRef, fields, { merge: true });
  };

  const handleImageUpload = async () => {
    const image = await pickImage();
    if (!image?.uri) return;

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
      payload.feedback = feedbackText;
    } else if (modalType === 'phone') {
      payload.phone = phone;
    }
    await saveToFirebase(payload);
    setModalVisible(false);
  };

  const handleFeedbackSubmit = async () => {
    const feedbackData = { rating, feedback: feedbackText };
    await saveToFirebase({ feedback: feedbackData });
    setFeedbackSubmitted(true);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) return <ActivityIndicator size="large" />;

  return (
    <>
      <Header />
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
            <Text style={styles.text} numberOfLines={1}>{feedbackText || 'No feedback given'}</Text>
            <Ionicons name="chatbubble-ellipses-outline" size={20} onPress={() => openModal('feedback')} />
          </View>
        </View>

        <TouchableOpacity onPress={() => openModal('feedbackForm')} style={styles.feedbackButton}>
          <Text style={styles.feedbackButtonText}>Leave Feedback</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        <Modal transparent visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>
                {modalType === 'name' && 'Edit Name'}
                {modalType === 'feedback' && 'Edit Feedback'}
                {modalType === 'phone' && 'Edit Phone'}
                {modalType === 'feedbackForm' && 'Leave Feedback'}
              </Text>

              {modalType === 'name' && (
                <TextInput style={styles.input} value={name} onChangeText={setName} />
              )}

              {modalType === 'feedback' && (
                <TextInput style={[styles.input, { height: 100 }]} multiline value={feedbackText} onChangeText={setFeedbackText} placeholder="Your feedback..." />
              )}

              {modalType === 'phone' && (
                <TextInput style={styles.input} keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
              )}

              {modalType === 'feedbackForm' && !feedbackSubmitted && (
                <View>
                  <Text>Rating (1 to 5):</Text>
                  <View style={styles.ratingContainer}>
                    {[1, 2, 3, 4, 5].map(rate => (
                      <TouchableOpacity
                        key={rate}
                        onPress={() => setRating(rate)}
                        style={[styles.ratingButton, rating === rate && styles.selectedRating]}
                        disabled={feedbackSubmitted}
                      >
                        <Text style={[styles.ratingText, rating === rate && styles.selectedRatingText]}>{rate}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TextInput
                    style={[styles.input, { height: 100 }]}
                    multiline
                    editable={!feedbackSubmitted}
                    value={feedbackText}
                    onChangeText={setFeedbackText}
                    placeholder="Leave your feedback..."
                  />
                </View>
              )}

              {modalType === 'feedbackForm' && feedbackSubmitted && (
                <View style={styles.thankYouContainer}>
                  <Text style={styles.thankYouEmoji}>🎉</Text>
                  <Text style={styles.thankYouTitle}>Thank you!</Text>
                  <Text style={styles.thankYouMessage}>We really appreciate your feedback.</Text>
                  <TouchableOpacity style={styles.closeThankYouButton} onPress={() => setModalVisible(false)}>
                    <Text style={styles.closeThankYouButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              )}

              {!feedbackSubmitted && modalType !== 'feedbackForm' && (
                <View style={styles.modalActions}>
                  <TouchableOpacity onPress={handleSave}>
                    <Text style={styles.saveBtn}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Text style={styles.cancelBtn}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}

              {modalType === 'feedbackForm' && !feedbackSubmitted && (
                <View style={styles.modalActions}>
                  <TouchableOpacity onPress={handleFeedbackSubmit}>
                    <Text style={styles.saveBtn}>Submit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Text style={styles.cancelBtn}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>
      </ScrollView>
      <Navbar/>
    </>
  );
};

const styles = StyleSheet.create({
  container: { marginTop:70,padding: 16 },
  avatarContainer: { alignItems: 'center', marginBottom: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  changePic: { color: '#3498db', fontSize: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  label: { fontSize: 16, fontWeight: '600' },
  rowRight: { flexDirection: 'row', alignItems: 'center' },
  text: { fontSize: 14, color: '#555' },
  feedbackButton: { marginTop: 20, paddingVertical: 10, backgroundColor: '#3498db', alignItems: 'center', borderRadius: 5 },
  feedbackButtonText: { color: '#fff', fontSize: 16 },
  logoutButton: { marginTop: 20, paddingVertical: 10, backgroundColor: '#e74c3c', alignItems: 'center', borderRadius: 5 },
  logoutButtonText: { color: '#fff', fontSize: 16 },
  modalBackdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContainer: { width: '80%', backgroundColor: '#fff', padding: 20, borderRadius: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { height: 40, borderColor: '#ccc', borderWidth: 1, marginBottom: 15, paddingLeft: 10, borderRadius: 5 },
  ratingContainer: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 },
  ratingButton: { padding: 10, backgroundColor: '#3498db', borderRadius: 5 },
  selectedRating: { backgroundColor: '#2ecc71' },
  ratingText: { color: '#fff' },
  selectedRatingText: { color: '#fff' },
  saveBtn: { backgroundColor: '#3498db', paddingVertical: 10, textAlign: 'center', color: '#fff', fontWeight: 'bold', borderRadius: 5 },
  cancelBtn: { paddingVertical: 10, textAlign: 'center', color: '#e74c3c', fontWeight: 'bold' },
  thankYouContainer: { alignItems: 'center', marginTop: 20 },
  thankYouEmoji: { fontSize: 48, marginBottom: 10 },
  thankYouTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 5 },
  thankYouMessage: { fontSize: 16, color: '#333', marginBottom: 20, textAlign: 'center' },
  closeThankYouButton: { backgroundColor: '#2ecc71', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  closeThankYouButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  modalActions: { marginTop: 20 }
});

export default ProfileScreen;
