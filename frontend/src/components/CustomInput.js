import { StyleSheet, Text, TextInput, View } from 'react-native';

export default function CustomInput({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, autoCapitalize = 'none', multiline = false, labelIcon, leftIcon, rightElement }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>{labelIcon ? <Text style={styles.labelIcon}>{labelIcon}</Text> : null}<Text style={styles.label}>{label}</Text></View>
      <View style={styles.inputFrame}>
        {leftIcon ? <Text style={styles.leadingIcon}>{leftIcon}</Text> : null}
        <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#8290A8"
          secureTextEntry={secureTextEntry} keyboardType={keyboardType} autoCapitalize={autoCapitalize} multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'} style={[styles.input, leftIcon && styles.inputWithIcon, rightElement && styles.inputWithRight, multiline && styles.multiline]} />
        {rightElement ? <View style={styles.rightElement}>{rightElement}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8, marginBottom: 19 }, labelRow: { flexDirection: 'row', alignItems: 'center', gap: 9 }, label: { color: '#11294F', fontSize: 14, fontWeight: '700' }, labelIcon: { color: '#2874F8', fontSize: 17, fontWeight: '700', width: 20, textAlign: 'center' },
  inputFrame: { minHeight: 54, borderRadius: 15, backgroundColor: '#F8FAFE', borderWidth: 1.4, borderColor: '#DCE3F0', flexDirection: 'row', alignItems: 'center' },
  input: { minHeight: 50, flex: 1, borderRadius: 13, paddingHorizontal: 15, backgroundColor: 'transparent', color: '#243650', fontSize: 15 },
  inputWithIcon: { paddingLeft: 7 }, inputWithRight: { paddingRight: 5 }, leadingIcon: { color: '#78869B', fontSize: 19, width: 48, textAlign: 'center', fontWeight: '600' },
  rightElement: { paddingHorizontal: 14 },
  multiline: { minHeight: 86, paddingTop: 14 },
});
