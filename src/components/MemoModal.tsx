// src/features/home/components/MemoModal.tsx
import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (text: string) => void;
};

export const MemoModal: React.FC<Props> = ({ visible, onClose, onSave }) => {
  const [memoText, setMemoText] = useState('');

  const wordCount = useMemo(() => {
    return memoText.trim() ? memoText.trim().split(/\s+/).length : 0;
  }, [memoText]);

  const overLimit = wordCount > 100;
  const canSave = memoText.trim().length > 0 && !overLimit;

  const handleSave = () => {
    if (!canSave) return;
    onSave(memoText.trim());
    setMemoText('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 w-full items-center justify-center"
      >
        {/* background overlay */}
        <Pressable className="absolute inset-0 bg-black/40" onPress={onClose} />

        {/* centered card */}
        <View className="w-11/12 max-w-md bg-white rounded-2xl p-5 shadow-lg">
          <Text className="text-lg font-semibold mb-2 text-center">Add memo</Text>

          <TextInput
            className="border border-gray-300 rounded-lg p-3 h-28 text-base"
            placeholder="Write a quick memo (max 100 words)…"
            value={memoText}
            onChangeText={setMemoText}
            multiline
            maxLength={1200}
            autoFocus
          />

          <View className="mt-3 flex-row justify-between items-center">
            <Text className={`text-xs ${overLimit ? 'text-red-600' : 'text-gray-500'}`}>
              {wordCount}/100 words
            </Text>
            <View className="flex-row gap-4">
              <Pressable
                onPress={() => {
                  setMemoText('');
                  onClose();
                }}
              >
                <Text className="text-gray-600 font-medium">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleSave}
                disabled={!canSave}
                className={`px-4 py-2 rounded-full ${canSave ? 'bg-blue-500' : 'bg-gray-300'}`}
              >
                <Text className="text-white font-semibold">Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
