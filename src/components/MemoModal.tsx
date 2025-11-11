import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

// Custom gradient component using View layers
const GradientView = ({ colors, style, children }: any) => (
  <View style={[style, { backgroundColor: colors[0], overflow: 'hidden' }]}>
    <View
      style={{
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors[1],
        opacity: 0.6,
      }}
    />
    {children}
  </View>
);

interface MemoModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (text: string) => void;
}

export function MemoModal({ visible, onClose, onSave }: MemoModalProps) {
  const [text, setText] = useState('');

  const handleSave = () => {
    if (text.trim()) {
      onSave(text.trim());
      setText('');
      onClose();
    }
  };

  const handleClose = () => {
    setText('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <Pressable style={styles.backdrop} onPress={handleClose}>
          <View style={[StyleSheet.absoluteFill, styles.backdropBlur]} />
        </Pressable>

        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add a Note</Text>
              <Text style={styles.modalSubtitle}>Record a special moment</Text>
            </View>

            <TextInput
              style={styles.textInput}
              placeholder="What's happening with baby?"
              placeholderTextColor="#B8B8B8"
              value={text}
              onChangeText={setText}
              multiline
              numberOfLines={4}
              autoFocus
            />

            <View style={styles.buttonRow}>
              <Pressable onPress={handleClose} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable onPress={handleSave} style={styles.saveButton}>
                <GradientView colors={['#FFB6D9', '#FF8FB9']} style={styles.saveButtonGradient}>
                  <Text style={styles.saveButtonText}>Save Note</Text>
                </GradientView>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropBlur: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
  },
  modalHeader: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#8B8B8B',
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    color: '#1A1A1A',
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5A5A5A',
  },
  saveButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
