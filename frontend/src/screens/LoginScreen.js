import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import { vi } from '../strings';

function Brand() {
  return (
    <View style={styles.brand}>
      <View style={styles.logo}><Text style={styles.logoText}>U</Text></View>
      <Text style={styles.brandName}>USERSPACE</Text>
    </View>
  );
}

function SecurityIllustration() {
  return (
    <View style={styles.illustration}>
      <View style={styles.plantStem} />
      <View style={[styles.leaf, styles.leafOne]} />
      <View style={[styles.leaf, styles.leafTwo]} />
      <View style={[styles.leaf, styles.leafThree]} />
      <View style={styles.laptopBase} />
      <View style={styles.laptop}>
        <View style={styles.laptopTop}><View style={styles.camera} /></View>
        <View style={styles.laptopScreen}>
          <View style={styles.screenAvatar}><Text style={styles.screenAvatarText}>U</Text></View>
          <View style={styles.screenLines}><View style={styles.linePrimary} /><View style={styles.lineSecondary} /><View style={styles.lineTertiary} /></View>
          <View style={styles.chart}><View style={styles.barOne} /><View style={styles.barTwo} /><View style={styles.barThree} /></View>
        </View>
      </View>
      <View style={styles.shield}><Text style={styles.shieldText}>{'\u2713'}</Text></View>
      <View style={styles.sparkOne} /><View style={styles.sparkTwo} /><View style={styles.sparkThree} />
    </View>
  );
}

export default function LoginScreen({ onLogin }) {
  const { width } = useWindowDimensions();
  const wide = width >= 1080;
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password.trim()) return Alert.alert(vi.missing, vi.fillLogin);
    setLoading(true);
    try {
      await onLogin({ email: email.trim(), password });
    } catch (error) {
      Alert.alert(vi.loginFailed, error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View pointerEvents="none" style={styles.backgroundShapeTop} />
      <View pointerEvents="none" style={styles.backgroundShapeBottom} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={[styles.layout, wide ? styles.wideLayout : styles.mobileLayout]} keyboardShouldPersistTaps="handled">
          <View style={[styles.introPanel, wide && styles.wideIntro]}>
            <Brand />
            <View style={styles.introCopy}>
              <Text style={styles.eyebrow}>{'\u2014  '}{vi.admin}</Text>
              <Text style={[styles.title, wide ? styles.wideTitle : styles.mobileTitle]}>{vi.welcome}</Text>
              <Text style={styles.subtitle}>{vi.loginHelp}</Text>
            </View>
            <View style={!wide && styles.mobileIllustration}><SecurityIllustration /></View>
          </View>

          <View style={[styles.formColumn, wide && styles.wideFormColumn]}>
            <View style={[styles.formCard, !wide && styles.mobileFormCard]}>
              <CustomInput label={vi.adminEmail} labelIcon={'\u2709'} leftIcon={'\u2709'} value={email} onChangeText={setEmail} placeholder="admin@example.com" keyboardType="email-address" />
              <CustomInput
                label={vi.password}
                labelIcon={'\u25A3'}
                leftIcon={'\u25A3'}
                value={password}
                onChangeText={setPassword}
                placeholder={vi.enterPassword}
                secureTextEntry={!showPassword}
                rightElement={<TouchableOpacity accessibilityRole="button" accessibilityLabel={showPassword ? vi.hidePassword : vi.showPassword} onPress={() => setShowPassword((visible) => !visible)}><Text style={styles.eye}>{showPassword ? '\u25C9' : '\u25CE'}</Text></TouchableOpacity>}
              />
              <CustomButton title={`${vi.login}     \u2192`} onPress={submit} loading={loading} style={styles.loginButton} />
            </View>
            <Text style={styles.footer}><Text style={styles.footerMuted}>USERSPACE   /   </Text><Text style={styles.footerBlue}>ADMIN</Text></Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, minHeight: '100%', backgroundColor: '#F5F8FF', overflow: 'hidden' },
  flex: { flex: 1 },
  layout: { flexGrow: 1, width: '100%', maxWidth: 1680, alignSelf: 'center' },
  wideLayout: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 62, gap: 56 },
  mobileLayout: { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 18 },
  backgroundShapeTop: { position: 'absolute', width: 560, height: 560, borderRadius: 180, backgroundColor: '#E5EEFF', top: -420, left: '27%', transform: [{ rotate: '42deg' }], opacity: 0.7 },
  backgroundShapeBottom: { position: 'absolute', width: 510, height: 510, borderRadius: 160, backgroundColor: '#DCE8FF', bottom: -390, left: -205, transform: [{ rotate: '32deg' }], opacity: 0.75 },
  introPanel: { flexGrow: 1, justifyContent: 'center', paddingVertical: 26 },
  wideIntro: { flex: 0.83, paddingVertical: 42 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 42 },
  logo: { height: 60, width: 60, borderRadius: 18, backgroundColor: '#2671FA', alignItems: 'center', justifyContent: 'center', shadowColor: '#286CF4', shadowOpacity: 0.2, shadowRadius: 13, shadowOffset: { width: 0, height: 8 } },
  logoText: { color: '#fff', fontSize: 34, fontWeight: '900' },
  brandName: { color: '#112A50', letterSpacing: 3, fontWeight: '900', fontSize: 21 },
  introCopy: { maxWidth: 470 },
  eyebrow: { color: '#2671FA', fontSize: 15, fontWeight: '900', letterSpacing: 1.1, marginBottom: 16 },
  title: { color: '#10274B', fontWeight: '900' },
  wideTitle: { fontSize: 58, lineHeight: 66 },
  mobileTitle: { fontSize: 42, lineHeight: 48 },
  subtitle: { color: '#687A97', fontSize: 17, lineHeight: 26, marginTop: 15, maxWidth: 430 },
  illustration: { height: 245, maxWidth: 530, width: '100%', marginTop: 28, position: 'relative', alignSelf: 'center' },
  mobileIllustration: { height: 155, overflow: 'hidden' },
  laptop: { position: 'absolute', width: '66%', height: 175, left: '24%', top: 20, borderColor: '#315C9D', borderWidth: 5, borderRadius: 18, backgroundColor: '#DCE8FF', transform: [{ rotate: '-7deg' }], padding: 11, shadowColor: '#315C9D', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 7 } },
  laptopTop: { height: 12, borderBottomColor: '#B6CCF3', borderBottomWidth: 1, alignItems: 'center' },
  camera: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#5C80BA' },
  laptopScreen: { flex: 1, marginTop: 8, borderRadius: 8, backgroundColor: '#F8FBFF', flexDirection: 'row', alignItems: 'center', padding: 12, gap: 11 },
  screenAvatar: { width: 55, height: 55, borderRadius: 28, backgroundColor: '#D7E6FF', alignItems: 'center', justifyContent: 'center' },
  screenAvatarText: { color: '#2773F5', fontWeight: '900', fontSize: 24 },
  screenLines: { flex: 1, gap: 8 },
  linePrimary: { height: 7, width: '80%', borderRadius: 4, backgroundColor: '#7EAAFA' },
  lineSecondary: { height: 6, width: '95%', borderRadius: 4, backgroundColor: '#C0D5FB' },
  lineTertiary: { height: 6, width: '63%', borderRadius: 4, backgroundColor: '#C0D5FB' },
  chart: { height: 68, width: 67, flexDirection: 'row', alignItems: 'flex-end', gap: 5, padding: 7, borderRadius: 8, backgroundColor: '#EDF4FF' },
  barOne: { height: 25, width: 10, borderRadius: 3, backgroundColor: '#8DB4FB' },
  barTwo: { height: 38, width: 10, borderRadius: 3, backgroundColor: '#5F95F4' },
  barThree: { height: 48, width: 10, borderRadius: 3, backgroundColor: '#3378F4' },
  laptopBase: { position: 'absolute', width: '77%', height: 12, left: '17%', bottom: 18, borderRadius: 9, backgroundColor: '#7595C8', transform: [{ rotate: '-2deg' }] },
  shield: { position: 'absolute', width: 75, height: 88, left: '18%', bottom: 21, borderRadius: 23, borderWidth: 5, borderColor: '#4A86F5', backgroundColor: '#256CF2', alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '8deg' }], shadowColor: '#2168F4', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } },
  shieldText: { color: '#fff', fontWeight: '900', fontSize: 36 },
  plantStem: { position: 'absolute', width: 3, height: 112, left: '8%', bottom: 19, backgroundColor: '#9DBCF5', transform: [{ rotate: '-16deg' }] },
  leaf: { position: 'absolute', width: 38, height: 69, borderRadius: 35, backgroundColor: '#C7DBFF', opacity: 0.85 },
  leafOne: { left: '4%', bottom: 95, transform: [{ rotate: '-40deg' }] },
  leafTwo: { left: '9%', bottom: 62, transform: [{ rotate: '35deg' }] },
  leafThree: { left: '1%', bottom: 43, transform: [{ rotate: '-55deg' }] },
  sparkOne: { position: 'absolute', right: '6%', top: 49, width: 8, height: 33, backgroundColor: '#3980F9', borderRadius: 5, transform: [{ rotate: '36deg' }] },
  sparkTwo: { position: 'absolute', right: '2%', top: 71, width: 8, height: 29, backgroundColor: '#3980F9', borderRadius: 5, transform: [{ rotate: '70deg' }] },
  sparkThree: { position: 'absolute', right: '1%', top: 109, width: 8, height: 22, backgroundColor: '#3980F9', borderRadius: 5, transform: [{ rotate: '100deg' }] },
  formColumn: { justifyContent: 'center' },
  wideFormColumn: { flex: 1.48, maxWidth: 900 },
  formCard: { backgroundColor: 'rgba(255,255,255,0.96)', borderRadius: 28, borderWidth: 1, borderColor: '#E2EAF7', padding: 40, shadowColor: '#3A67A8', shadowOpacity: 0.12, shadowRadius: 28, shadowOffset: { width: 0, height: 14 }, elevation: 8 },
  mobileFormCard: { padding: 22, borderRadius: 22 },
  loginButton: { marginTop: 7, minHeight: 62, borderRadius: 15, shadowColor: '#2265EC', shadowOpacity: 0.24, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
  eye: { color: '#65738A', fontSize: 21, fontWeight: '700' },
  footer: { textAlign: 'center', marginTop: 30, fontSize: 14, fontWeight: '900', letterSpacing: 1.7 },
  footerMuted: { color: '#8997AE' },
  footerBlue: { color: '#2671FA' },
});
