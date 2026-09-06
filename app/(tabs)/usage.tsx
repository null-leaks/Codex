// Usage / Billing Screen — Codex by killarua
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Font, Spacing, Radius } from '@/constants/theme';
import { usePuter } from '@/hooks/usePuter';

function BarChart({ data }: { data: { date: string; tokens: number; cost: number }[] }) {
  const max = Math.max(...data.map(d => d.tokens), 1);
  return (
    <View style={chart.container}>
      {data.map((d, i) => (
        <View key={i} style={chart.col}>
          <View style={chart.barWrapper}>
            <View
              style={[
                chart.bar,
                {
                  height: Math.max(4, (d.tokens / max) * 80),
                  backgroundColor: i === data.length - 1 ? Colors.primary : Colors.primary + '55',
                },
              ]}
            />
          </View>
          <Text style={chart.label}>{d.date.slice(5)}</Text>
        </View>
      ))}
    </View>
  );
}

const chart = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 100,
    paddingTop: Spacing.sm,
  },
  col: { flex: 1, alignItems: 'center', gap: 4 },
  barWrapper: { height: 80, justifyContent: 'flex-end' },
  bar: { width: '60%', borderRadius: 3, minHeight: 4 },
  label: { fontSize: 9, color: Colors.textMuted },
});

export default function UsageScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, token, usageStats, logout } = usePuter();

  const stats = [
    { label: 'Total Tokens', value: usageStats.total_tokens.toLocaleString(), icon: 'token' as const, color: Colors.primary },
    { label: 'Prompt', value: usageStats.prompt_tokens.toLocaleString(), icon: 'arrow-upward' as const, color: Colors.accent },
    { label: 'Completion', value: usageStats.completion_tokens.toLocaleString(), icon: 'arrow-downward' as const, color: Colors.warning },
    { label: 'Requests', value: usageStats.requests.toLocaleString(), icon: 'repeat' as const, color: Colors.textSecondary },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Usage & Billing</Text>
        {!token && (
          <Pressable
            style={({ pressed }) => [styles.loginBtn, pressed && { opacity: 0.8 }]}
            onPress={() => router.push('/login')}
          >
            <MaterialIcons name="login" size={14} color={Colors.bg} />
            <Text style={styles.loginBtnText}>Login</Text>
          </Pressable>
        )}
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user ? user.username[0].toUpperCase() : '?'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user ? user.username : 'Not logged in'}</Text>
            <Text style={styles.userEmail}>{user?.email || (token ? 'Puter account' : 'Guest mode')}</Text>
            {user?.is_pro && (
              <View style={styles.proBadge}>
                <MaterialIcons name="star" size={10} color="#FFD700" />
                <Text style={styles.proText}>PRO</Text>
              </View>
            )}
          </View>
          {token && (
            <Pressable onPress={logout} hitSlop={8} style={styles.logoutBtn}>
              <MaterialIcons name="logout" size={18} color={Colors.danger} />
            </Pressable>
          )}
        </View>

        {/* Model Info */}
        <View style={styles.modelCard}>
          <MaterialIcons name="memory" size={20} color={Colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.modelName}>dolphin-mistral-24b-venice-edition</Text>
            <Text style={styles.modelProvider}>cognitivecomputations · via Puter AI</Text>
          </View>
          <View style={styles.activeBadge}>
            <View style={styles.activeDot} />
            <Text style={styles.activeText}>Active</Text>
          </View>
        </View>

        {/* Cost Card */}
        <View style={styles.costCard}>
          <View>
            <Text style={styles.costLabel}>Estimated Cost</Text>
            <Text style={styles.costValue}>${usageStats.cost_usd.toFixed(4)}</Text>
          </View>
          <View style={styles.costDivider} />
          <View>
            <Text style={styles.costLabel}>This Month</Text>
            <Text style={styles.costPeriod}>
              {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
            </Text>
          </View>
          <View style={styles.costIcon}>
            <MaterialIcons name="account-balance-wallet" size={28} color={Colors.primary} />
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map(s => (
            <View key={s.label} style={styles.statCard}>
              <MaterialIcons name={s.icon} size={20} color={s.color} />
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Daily Token Usage</Text>
          <BarChart data={usageStats.daily} />
          <View style={styles.chartLegend}>
            <View style={styles.legendDot} />
            <Text style={styles.legendText}>Tokens per day</Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <MaterialIcons name="info-outline" size={16} color={Colors.textMuted} />
          <Text style={styles.infoText}>
            Usage stats reflect dolphin-mistral-24b consumption via Puter AI gateway. Pricing: ~$0.80/1M tokens.
          </Text>
        </View>

        {/* Codex Brand */}
        <View style={styles.brandFooter}>
          <Text style={styles.brandLogo}>CODEX</Text>
          <Text style={styles.brandBy}>by killarua</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  headerTitle: { fontSize: Font.xl, fontWeight: '700', color: Colors.textPrimary },
  loginBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.primary, borderRadius: Radius.full,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  loginBtnText: { fontSize: Font.sm, fontWeight: '700', color: Colors.bg },
  scroll: { padding: Spacing.md, gap: Spacing.md },
  userCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.card, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, gap: Spacing.md,
  },
  avatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.primaryDim, borderWidth: 2, borderColor: Colors.primary + '66',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: Font.xl, fontWeight: '700', color: Colors.primary },
  userInfo: { flex: 1 },
  userName: { fontSize: Font.lg, fontWeight: '700', color: Colors.textPrimary },
  userEmail: { fontSize: Font.sm, color: Colors.textSecondary, marginTop: 2 },
  proBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4,
    backgroundColor: '#FFD70022', borderRadius: Radius.full,
    paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start',
    borderWidth: 1, borderColor: '#FFD70055',
  },
  proText: { fontSize: Font.xs, color: '#FFD700', fontWeight: '700' },
  logoutBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  modelCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.primaryDim, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.primary + '44', padding: Spacing.md,
  },
  modelName: { fontSize: Font.sm, fontWeight: '700', color: Colors.primary },
  modelProvider: { fontSize: Font.xs, color: Colors.textSecondary, marginTop: 2 },
  activeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  activeText: { fontSize: Font.xs, color: Colors.primary, fontWeight: '600' },
  costCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.card, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border, padding: Spacing.lg, gap: Spacing.lg,
  },
  costLabel: { fontSize: Font.sm, color: Colors.textSecondary, marginBottom: 4 },
  costValue: { fontSize: Font.hero, fontWeight: '800', color: Colors.primary },
  costPeriod: { fontSize: Font.md, fontWeight: '600', color: Colors.textPrimary },
  costDivider: { width: 1, height: 40, backgroundColor: Colors.border },
  costIcon: { marginLeft: 'auto' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  statCard: {
    flex: 1, minWidth: '45%', backgroundColor: Colors.card,
    borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.md, gap: 4,
  },
  statValue: { fontSize: Font.xl, fontWeight: '800' },
  statLabel: { fontSize: Font.xs, color: Colors.textMuted },
  chartCard: {
    backgroundColor: Colors.card, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border, padding: Spacing.md,
  },
  sectionTitle: { fontSize: Font.md, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm },
  chartLegend: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.sm,
  },
  legendDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  legendText: { fontSize: Font.xs, color: Colors.textMuted },
  infoCard: {
    flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start',
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border, padding: Spacing.md,
  },
  infoText: { flex: 1, fontSize: Font.xs, color: Colors.textMuted, lineHeight: 18 },
  brandFooter: { alignItems: 'center', paddingVertical: Spacing.md },
  brandLogo: { fontSize: Font.xxl, fontWeight: '800', color: Colors.primary + '44', letterSpacing: 6 },
  brandBy: { fontSize: Font.sm, color: Colors.textMuted, letterSpacing: 2 },
});
