// Chat Screen — Codex by killarua
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Font, Spacing, Radius } from '@/constants/theme';
import { usePuter } from '@/hooks/usePuter';
import { useAIChat } from '@/hooks/useAIChat';
import { MessageBubble } from '@/components/feature/MessageBubble';
import { TypingIndicator } from '@/components/feature/TypingIndicator';
import { ChatMessage } from '@/services/puterService';

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, token, createSession, activeSessionId } = usePuter();
  const { messages, isTyping, sendMessage, sessionTitle } = useAIChat();
  const [input, setInput] = useState('');
  const flatRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
  };

  const handleNewChat = () => {
    createSession();
  };

  const data: (ChatMessage | { id: 'typing' })[] = [
    ...messages.map((m, i) => ({ ...m, id: String(i) })),
    ...(isTyping ? [{ id: 'typing' as const }] : []),
  ];

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.statusDot} />
          <View>
            <Text style={styles.headerTitle}>CODEX</Text>
            <Text style={styles.headerSub} numberOfLines={1}>
              {sessionTitle || 'dolphin-mistral-24b'}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          {!token && (
            <Pressable
              style={styles.loginChip}
              onPress={() => router.push('/login')}
              hitSlop={8}
            >
              <MaterialIcons name="login" size={14} color={Colors.warning} />
              <Text style={styles.loginChipText}>Login</Text>
            </Pressable>
          )}
          <Pressable onPress={handleNewChat} hitSlop={8} style={styles.iconBtn}>
            <MaterialIcons name="add-comment" size={22} color={Colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      {/* Messages */}
      {messages.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyLogo}>⬡</Text>
          <Text style={styles.emptyTitle}>Start a conversation</Text>
          <Text style={styles.emptySub}>
            Powered by dolphin-mistral-24b{'\n'}via Puter AI
          </Text>
          <View style={styles.suggestions}>
            {['Explain quantum computing', 'Write a Python script', 'Summarize a topic'].map(s => (
              <Pressable
                key={s}
                style={({ pressed }) => [styles.suggestionChip, pressed && { opacity: 0.7 }]}
                onPress={() => sendMessage(s)}
              >
                <Text style={styles.suggestionText}>{s}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          ref={flatRef}
          data={data}
          keyExtractor={(item, i) => ('id' in item ? item.id : String(i))}
          renderItem={({ item }) => {
            if ('id' in item && item.id === 'typing') return <TypingIndicator />;
            return <MessageBubble message={item as ChatMessage} />;
          }}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
        />
      )}

      {/* Input */}
      <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Message Codex..."
            placeholderTextColor={Colors.textMuted}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={4000}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <Pressable
            onPress={handleSend}
            disabled={!input.trim() || isTyping}
            style={({ pressed }) => [
              styles.sendBtn,
              (!input.trim() || isTyping) && styles.sendBtnDisabled,
              pressed && { opacity: 0.8 },
            ]}
          >
            <MaterialIcons
              name="send"
              size={18}
              color={!input.trim() || isTyping ? Colors.textMuted : Colors.bg}
            />
          </Pressable>
        </View>
        {!token && (
          <Text style={styles.guestNote}>
            Guest mode — Login for full AI access
          </Text>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  headerTitle: {
    fontSize: Font.lg,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 3,
  },
  headerSub: {
    fontSize: Font.xs,
    color: Colors.textMuted,
    maxWidth: 200,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  loginChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.warning + '22',
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.warning + '55',
  },
  loginChipText: {
    fontSize: Font.xs,
    color: Colors.warning,
    fontWeight: '600',
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyLogo: {
    fontSize: 64,
    marginBottom: Spacing.md,
    color: Colors.primary,
  },
  emptyTitle: {
    fontSize: Font.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptySub: {
    fontSize: Font.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  suggestions: {
    gap: Spacing.sm,
    width: '100%',
  },
  suggestionChip: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    alignItems: 'center',
  },
  suggestionText: {
    fontSize: Font.sm,
    color: Colors.textSecondary,
  },
  messageList: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  inputBar: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: Font.md,
    maxHeight: 120,
    lineHeight: 22,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sendBtnDisabled: {
    backgroundColor: Colors.border,
  },
  guestNote: {
    fontSize: Font.xs,
    color: Colors.warning + 'aa',
    textAlign: 'center',
    marginTop: 6,
  },
});
