// MessageBubble — Codex by killarua
import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius, Font, Spacing } from '@/constants/theme';
import { ChatMessage } from '@/services/puterService';

interface Props {
  message: ChatMessage;
}

export const MessageBubble = memo(function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAI]}>
      {!isUser && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>C</Text>
        </View>
      )}
      <View
        style={[
          styles.bubble,
          isUser ? styles.bubbleUser : styles.bubbleAI,
        ]}
      >
        <Text style={[styles.text, isUser ? styles.textUser : styles.textAI]}>
          {message.content}
        </Text>
      </View>
      {isUser && (
        <View style={[styles.avatar, styles.avatarUser]}>
          <Text style={styles.avatarText}>U</Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  rowAI: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryDim,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarUser: {
    backgroundColor: Colors.accentDim,
    borderColor: Colors.accent,
  },
  avatarText: {
    color: Colors.primary,
    fontSize: Font.sm,
    fontWeight: '700',
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  bubbleUser: {
    backgroundColor: Colors.userDim,
    borderWidth: 1,
    borderColor: Colors.user + '55',
    borderBottomRightRadius: 4,
  },
  bubbleAI: {
    backgroundColor: Colors.aiDim,
    borderWidth: 1,
    borderColor: Colors.ai + '44',
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: Font.md,
    lineHeight: 22,
  },
  textUser: {
    color: Colors.user,
  },
  textAI: {
    color: Colors.textPrimary,
  },
});
