import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Alert,
  Switch,
} from 'react-native';

export type SettingsModalProps = {
  visible: boolean;
  onClose: () => void;
  highlightLatestFeed: boolean;
  onToggleHighlight: (next: boolean) => void;
};

// Hardcoded as requested
const PRIVACY_URL = 'https://sites.google.com/view/aribabylogger';

const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  highlightLatestFeed,
  onToggleHighlight,
}) => {
  const openPrivacy = async () => {
    try {
      await Linking.openURL(PRIVACY_URL);
    } catch {
      Alert.alert('Error', 'Could not open privacy policy.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.center}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.card}>
          <Text style={styles.title}>Settings</Text>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Highlight latest feeding</Text>
              <Text style={styles.subtle}>Yellow tint on the newest feed log</Text>
            </View>
            <Switch value={highlightLatestFeed} onValueChange={onToggleHighlight} />
          </View>

          <Pressable onPress={openPrivacy} style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>Privacy Policy</Text>
          </Pressable>

          <Pressable onPress={onClose} style={styles.secondaryBtn}>
            <Text style={styles.secondaryBtnText}>Close</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  card: {
    width: '88%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
  },
  title: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  label: { fontSize: 16, fontWeight: '600', color: '#1A1A1A' },
  subtle: { fontSize: 12, color: '#8B8B8B', marginTop: 2 },
  primaryBtn: {
    marginTop: 8,
    backgroundColor: '#8CB8FF',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  secondaryBtn: {
    marginTop: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryBtnText: { color: '#5A5A5A', fontWeight: '700', fontSize: 15 },
});

export default SettingsModal;
