import { useEffect, useState } from 'react';
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { resolveImageUrl } from '../services/api';
import { vi } from '../strings';

export default function ViewUserScreen({ user, onBack }) {
  const initials = user.name?.trim().split(/\s+/).slice(-2).map((part) => part[0]).join('').toUpperCase() || 'U';
  const imageUri = resolveImageUrl(user.image);
  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => { setImageFailed(false); }, [imageUri]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topbar}>
        <TouchableOpacity accessibilityRole="button" onPress={onBack} style={styles.back}>
          <Text style={styles.backArrow}>{'<'}</Text><Text style={styles.backText}>{vi.back}</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>{vi.viewTitle}</Text>
        <View style={styles.spacer} />
      </View>
      <View style={styles.content}>
        {imageUri && !imageFailed
          ? <Image source={{ uri: imageUri }} style={styles.avatar} onError={() => setImageFailed(true)} />
          : <View style={[styles.avatar, styles.fallback]}><Text style={styles.initials}>{initials}</Text></View>}
        <Text style={styles.name}>{user.name}</Text>
        <View style={styles.details}>
          <Text style={styles.label}>{vi.name}</Text>
          <Text style={styles.value}>{user.name}</Text>
          <View style={styles.divider} />
          <Text style={styles.label}>{vi.email}</Text>
          <Text style={styles.value}>{user.email}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F9FC' },
  topbar: { height: 58, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EEF0F4', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18 },
  back: { flexDirection: 'row', alignItems: 'center', width: 90 },
  backArrow: { fontSize: 24, color: '#46546A', marginRight: 8 },
  backText: { color: '#59667B', fontSize: 13, fontWeight: '600' },
  topTitle: { color: '#243149', fontSize: 14, fontWeight: '700' },
  spacer: { width: 90 },
  content: { width: '100%', maxWidth: 560, alignSelf: 'center', padding: 24, alignItems: 'center' },
  avatar: { width: 112, height: 112, borderRadius: 32, marginTop: 24 },
  fallback: { backgroundColor: '#EAF1FF', alignItems: 'center', justifyContent: 'center' },
  initials: { color: '#246BFD', fontWeight: '800', fontSize: 30 },
  name: { color: '#152238', fontSize: 24, fontWeight: '800', marginTop: 16, textAlign: 'center' },
  details: { width: '100%', backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#EEF0F4', padding: 18, marginTop: 26 },
  label: { color: '#8995A7', fontSize: 12, fontWeight: '700' },
  value: { color: '#243149', fontSize: 15, marginTop: 6 },
  divider: { height: 1, backgroundColor: '#EEF0F4', marginVertical: 16 },
});
