// Login Screen — Codex by killarua
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Font, Spacing, Radius } from '@/constants/theme';
import { usePuter } from '@/hooks/usePuter';
import { useAlert } from '@/template';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setToken, setUser } = usePuter();
  const { showAlert } = useAlert();

  const [token, setTokenInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showToken, setShowToken] = useState(false);

  const handleLogin = async () => {
    const trimmed = token.trim();
    if (!trimmed) {
      showAlert('Missing Token', 'Please enter your Puter API token.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('https://api.puter.com/whoami', {
        headers: { Authorization: `Bearer ${trimmed}` },
      });
      if (!res.ok) throw new Error('Invalid token or unauthorized.');
      const userData = await res.json();
      setToken(trimmed);
      setUser({
        uuid: userData.uuid || userData.id || 'user',
        username: userData.username || 'user',
        email: userData.email,
        is_pro: userData.is_pro || false,
      });
      router.replace('/(tabs)');
    } catch (err: any) {
      showAlert('Login Failed', err.message || 'Could not authenticate with Puter.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = () => {
    setUser({ uuid: 'guest', username: 'Guest', is_pro: false });
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.heroContainer}>
          <Image
            source={require('@/assets/images/hero.png')}
            style={styles.hero}
            contentFit="cover"
            transition={300}
          />
          <View style={styles.heroOverlay} />
        </View>

        {/* Brand */}
        <View style={styles.brand}>
          <Text style={styles.logo}>CODEX</Text>
          <Text style={styles.tagline}>AI by killarua</Text>
          <View style={styles.modelBadge}>
            <MaterialIcons name="memory" size={12} color={Colors.primary} />
            <Text style={styles.modelText}>dolphin-mistral-24b</Text>
          </View>
        </View>

        {/* Login Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Connect to Puter</Text>
          <Text style={styles.cardSubtitle}>
            Enter your Puter API token to access AI, file storage, and usage tracking.
          </Text>

          <View style={styles.inputWrapper}>
            <MaterialIcons name="vpn-key" size={18} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Paste your Puter token..."
              placeholderTextColor={Colors.textMuted}
              value={token}
              onChangeText={setTokenInput}
              secureTextEntry={!showToken}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Pressable onPress={() => setShowToken(v => !v)} hitSlop={8}>
              <MaterialIcons
                name={showToken ? 'visibility-off' : 'visibility'}
                size={18}
                color={Colors.textMuted}
              />
            </Pressable>
          </View>

          <View style={styles.hint}>
            <MaterialIcons name="info-outline" size={14} color={Colors.textMuted} />
            <Text style={styles.hintText}>
              Get your token at puter.com → Settings → API Keys
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [styles.loginBtn, pressed && { opacity: 0.8 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.bg} />
            ) : (
              <>
                <MaterialIcons name="login" size={18} color={Colors.bg} />
                <Text style={styles.loginBtnText}>Login with Puter</Text>
              </>
            )}
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.guestBtn, pressed && { opacity: 0.7 }]}
            onPress={handleGuestMode}
          >
            <Text style={styles.guestBtnText}>Continue as Guest</Text>
          </Pressable>
        </View>

        <Text style={styles.footer}>Codex v1.0 · Built by killarua</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  heroContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.primary + '44',
  },
  hero: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.bg + '33',
  },
  brand: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logo: {
    fontSize: 40,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 8,
  },
  tagline: {
    fontSize: Font.md,
    color: Colors.textSecondary,
    marginTop: 4,
    letterSpacing: 2,
  },
  modelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: Spacing.sm,
    backgroundColor: Colors.primaryDim,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.primary + '44',
  },
  modelText: {
    fontSize: Font.xs,
    color: Colors.primary,
    fontWeight: '600',
  },
  card: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    fontSize: Font.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  cardSubtitle: {
    fontSize: Font.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 52,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  inputIcon: {
    flexShrink: 0,
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: Font.md,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.lg,
  },
  hintText: {
    fontSize: Font.xs,
    color: Colors.textMuted,
    flex: 1,
    lineHeight: 16,
  },
  loginBtn: {
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: Spacing.md,
  },
  loginBtnText: {
    fontSize: Font.md,
    fontWeight: '700',
    color: Colors.bg,
  },
  guestBtn: {
    height: 48,
    backgroundColor: 'transparent',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestBtnText: {
    fontSize: Font.md,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  footer: {
    fontSize: Font.xs,
    color: Colors.textMuted,
    marginTop: Spacing.md,
  },
});
