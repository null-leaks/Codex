// Chat History Screen — Codex by killarua
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Font, Spacing, Radius } from '@/constants/theme';
import { usePuter } from '@/hooks/usePuter';
import { ChatSession } from '@/contexts/PuterContext';

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { sessions, setActiveSession, deleteSession, createSession } = usePuter();

  const handleOpen = (session: ChatSession) => {
    setActiveSession(session.id);
    router.push('/(tabs)');
  };

  const handleNew = () => {
    createSession();
    router.push('/(tabs)');
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  const getPreview = (session: ChatSession) => {
    const last = session.messages[session.messages.length - 1];
    if (!last) return 'No messages yet';
    return last.content.slice(0, 80) + (last.content.length > 80 ? '...' : '');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>History</Text>
        <Pressable
          style={({ pressed }) => [styles.newBtn, pressed && { opacity: 0.8 }]}
          onPress={handleNew}
        >
          <MaterialIcons name="add" size={18} color={Colors.bg} />
          <Text style={styles.newBtnText}>New Chat</Text>
        </Pressable>
      </View>

      {sessions.length === 0 ? (
        <View style={styles.empty}>
          <MaterialIcons name="history" size={64} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No conversations yet</Text>
          <Text style={styles.emptySub}>Start chatting to see your history here.</Text>
          <Pressable
            style={({ pressed }) => [styles.startBtn, pressed && { opacity: 0.8 }]}
            onPress={handleNew}
          >
            <Text style={styles.startBtnText}>Start a Chat</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={s => s.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.card, pressed && { opacity: 0.8 }]}
              onPress={() => handleOpen(item)}
            >
              <View style={styles.cardLeft}>
                <View style={styles.iconBox}>
                  <MaterialIcons name="chat-bubble-outline" size={18} color={Colors.primary} />
                </View>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.cardRow}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.title || 'Untitled'}
                  </Text>
                  <Text style={styles.cardTime}>{formatDate(item.updatedAt)}</Text>
                </View>
                <Text style={styles.cardPreview} numberOfLines={2}>
                  {getPreview(item)}
                </Text>
                <View style={styles.cardMeta}>
                  <MaterialIcons name="message" size={12} color={Colors.textMuted} />
                  <Text style={styles.metaText}>{item.messages.length} messages</Text>
                </View>
              </View>
              <Pressable
                onPress={() => deleteSession(item.id)}
                hitSlop={8}
                style={styles.deleteBtn}
              >
                <MaterialIcons name="delete-outline" size={18} color={Colors.textMuted} />
              </Pressable>
            </Pressable>
          )}
        />
      )}
    </View>
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
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  headerTitle: {
    fontSize: Font.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  newBtnText: {
    fontSize: Font.sm,
    fontWeight: '700',
    color: Colors.bg,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Font.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  emptySub: {
    fontSize: Font.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  startBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  startBtnText: {
    color: Colors.bg,
    fontWeight: '700',
    fontSize: Font.md,
  },
  list: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  cardLeft: {
    flexShrink: 0,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryDim,
    borderWidth: 1,
    borderColor: Colors.primary + '44',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: Font.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  cardTime: {
    fontSize: Font.xs,
    color: Colors.textMuted,
    flexShrink: 0,
  },
  cardPreview: {
    fontSize: Font.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 6,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: Font.xs,
    color: Colors.textMuted,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
