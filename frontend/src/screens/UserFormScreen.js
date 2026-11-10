import { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import { resolveImageUrl } from '../services/api';
import { vi } from '../strings';

export default function UserFormScreen({ mode, user, onBack, onSave }) {
  const editing = mode === 'edit';
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [image, setImage] = useState(user?.image || '');
  const [imageFile, setImageFile] = useState(null);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  useEffect(() => { setName(user?.name || ''); setEmail(user?.email || ''); setPassword(''); setImage(user?.image || ''); setImageFile(null); setPreviewFailed(false); }, [user]);
  const previewUri = imageFile?.uri || resolveImageUrl(image);
  useEffect(() => { setPreviewFailed(false); }, [previewUri]);
  const chooseImage = async () => {
    setErrorMessage('');
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 1,
        preferredAssetRepresentationMode: ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      const imageContext = ImageManipulator.manipulate(asset.uri, { maxWidth: 1600, maxHeight: 1600 });
      const renderedImage = await imageContext.renderAsync();
      const jpeg = await renderedImage.saveAsync({ format: SaveFormat.JPEG, compress: 0.85 });
      setImage('');
      setPreviewFailed(false);
      setImageFile({ uri: jpeg.uri, name: `avatar-${Date.now()}.jpg`, type: 'image/jpeg' });
    } catch (error) {
      setErrorMessage(error.message || vi.imageProcessFailed);
    }
  };
  const save = async () => {
    setErrorMessage('');
    if (!name.trim() || !email.trim() || (!editing && !password.trim())) return setErrorMessage(vi.required);
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setErrorMessage(vi.checkEmail);
    if ((!editing || password) && password.length < 6) return setErrorMessage(vi.passwordMinLength);
    setSaving(true);
    try {
      await onSave({ id: user?.id, name: name.trim(), email: email.trim(), password, image: image.trim(), imageFile });
    } catch (error) {
      setErrorMessage(error.message || vi.actionFailed);
      setSaving(false);
    }
  };
  return (
    <SafeAreaView style={styles.safe}><KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.topbar}><TouchableOpacity onPress={onBack} style={styles.back}><Text style={styles.backArrow}>{'<'}</Text><Text style={styles.backText}>{vi.back}</Text></TouchableOpacity><Text style={styles.topTitle}>{editing ? vi.editTitle : vi.newUser}</Text><View style={styles.spacer} /></View>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>{vi.admin}</Text><Text style={styles.title}>{editing ? vi.updateUser : vi.addTitle}</Text><Text style={styles.subtitle}>{editing ? vi.formHelpEdit : vi.formHelpAdd}</Text>
        <View style={styles.avatarSection}>{previewUri && !previewFailed ? <Image source={{ uri: previewUri }} style={styles.avatar} onError={() => setPreviewFailed(true)} /> : <View style={styles.avatar}><Text style={styles.avatarText}>{name ? name.trim().split(/\s+/).slice(-2).map((x) => x[0]).join('').toUpperCase() : '+'}</Text></View>}<View style={styles.avatarCopy}><Text style={styles.avatarHeading}>{vi.image}</Text><Text style={styles.avatarHint}>{imageFile?.name || vi.imageHint}</Text><TouchableOpacity accessibilityRole="button" onPress={chooseImage} style={styles.pickButton}><Text style={styles.pickButtonText}>{vi.chooseImage}</Text></TouchableOpacity></View></View>
        <CustomInput label={vi.name} value={name} onChangeText={setName} placeholder={vi.nameHint} autoCapitalize="words" />
        <CustomInput label={vi.email} value={email} onChangeText={setEmail} placeholder={vi.emailHint} keyboardType="email-address" />
        <CustomInput label={editing ? vi.newPassword : vi.password} value={password} onChangeText={setPassword} placeholder={editing ? vi.optional : vi.enterPassword} secureTextEntry />
        {errorMessage ? <Text accessibilityRole="alert" style={styles.error}>{errorMessage}</Text> : null}
        <View style={styles.buttons}><CustomButton title={vi.cancel} variant="secondary" onPress={onBack} style={styles.cancel} disabled={saving} /><CustomButton title={editing ? vi.save : vi.create} onPress={save} loading={saving} style={styles.save} /></View>
      </ScrollView>
    </KeyboardAvoidingView></SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F9FC' }, flex: { flex: 1 }, topbar: { height: 58, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EEF0F4', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18 },
  back: { flexDirection: 'row', alignItems: 'center', width: 90 }, backArrow: { fontSize: 24, color: '#46546A', marginRight: 8 }, backText: { color: '#59667B', fontSize: 13, fontWeight: '600' }, topTitle: { color: '#243149', fontSize: 14, fontWeight: '700' }, spacer: { width: 90 },
  content: { padding: 23, paddingBottom: 40 }, eyebrow: { color: '#246BFD', fontSize: 10, letterSpacing: 1.3, fontWeight: '800', marginTop: 8 }, title: { color: '#152238', fontSize: 27, fontWeight: '800', marginTop: 8 }, subtitle: { color: '#7C8799', fontSize: 13, marginTop: 6, marginBottom: 23 },
  avatarSection: { backgroundColor: '#fff', borderRadius: 15, padding: 15, flexDirection: 'row', alignItems: 'center', marginBottom: 22, borderWidth: 1, borderColor: '#EDF0F4' }, avatar: { width: 54, height: 54, borderRadius: 17, backgroundColor: '#EAF1FF', alignItems: 'center', justifyContent: 'center' }, avatarText: { color: '#246BFD', fontWeight: '800', fontSize: 16 }, avatarCopy: { marginLeft: 13 }, avatarHeading: { color: '#25334A', fontWeight: '700', fontSize: 13 }, avatarHint: { color: '#8A95A6', fontSize: 11, marginTop: 4 },
  pickButton: { alignSelf: 'flex-start', backgroundColor: '#EEF4FF', borderRadius: 9, paddingHorizontal: 12, paddingVertical: 8, marginTop: 9 }, pickButtonText: { color: '#246BFD', fontSize: 12, fontWeight: '700' },
  buttons: { flexDirection: 'row', gap: 10, marginTop: 6 }, cancel: { flex: 1 }, save: { flex: 1.5 },
  error: { color: '#C62828', fontSize: 13, marginBottom: 14 },
});
