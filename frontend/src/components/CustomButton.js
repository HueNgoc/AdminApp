import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

export default function CustomButton({ title, onPress, variant = 'primary', loading = false, disabled = false, style }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} disabled={disabled || loading}
      style={({ pressed }) => [styles.button, variants[variant], pressed && styles.pressed, (disabled || loading) && styles.disabled, style]}>
      {loading ? <ActivityIndicator color={variant === 'primary' ? '#fff' : '#246BFD'} /> : <Text style={[styles.label, variant !== 'primary' && styles.secondaryLabel]}>{title}</Text>}
    </Pressable>
  );
}

const variants = {
  primary: { backgroundColor: '#246BFD' },
  secondary: { backgroundColor: '#EEF4FF', borderWidth: 1, borderColor: '#DCE7FF' },
  danger: { backgroundColor: '#FFF0F0', borderWidth: 1, borderColor: '#FFDADA' },
};
const styles = StyleSheet.create({
  button: { minHeight: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  label: { color: '#fff', fontSize: 15, fontWeight: '700' },
  secondaryLabel: { color: '#246BFD' }, pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] }, disabled: { opacity: 0.58 },
});
