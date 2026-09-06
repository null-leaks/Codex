// Files Screen — Codex by killarua
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Font, Spacing, Radius } from '@/constants/theme';
import { usePuter } from '@/hooks/usePuter';
import { useAlert } from '@/template';
import {
  puterListFiles,
  puterDeleteFile,
  puterCreateFolder,
  puterWriteFile,
  PuterFile,
} from '@/services/puterService';

const PERMISSION_LEVELS = [
  { key: 'none', label: 'None', desc: 'No file access', icon: 'block' as const, color: Colors.textMuted },
  { key: 'read', label: 'Read Only', desc: 'Browse & read files', icon: 'visibility' as const, color: Colors.accent },
  { key: 'full', label: 'Full Access', desc: 'Read, write & delete', icon: 'storage' as const, color: Colors.primary },
];

export default function FilesScreen() {
  const insets = useSafeAreaInsets();
  const { token, storagePermission, setStoragePermission } = usePuter();
  const { showAlert } = useAlert();

  const [path, setPath] = useState('/');
  const [pathHistory, setPathHistory] = useState<string[]>([]);
  const [files, setFiles] = useState<PuterFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPermModal, setShowPermModal] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newContent, setNewContent] = useState('');

  const loadFiles = useCallback(async (p: string) => {
    if (!token) {
      showAlert('Not Logged In', 'Please login with your Puter account to access files.');
      return;
    }
    if (storagePermission === 'none') {
      setShowPermModal(true);
      return;
    }
    setLoading(true);
    try {
      const list = await puterListFiles(p, token);
      setFiles(list);
      setPath(p);
    } catch (err: any) {
      showAlert('Error', err.message || 'Failed to load files');
    } finally {
      setLoading(false);
    }
  }, [token, storagePermission, showAlert]);

  const navigateTo = (newPath: string) => {
    setPathHistory(prev => [...prev, path]);
    loadFiles(newPath);
  };

  const goBack = () => {
    const prev = pathHistory[pathHistory.length - 1];
    if (prev !== undefined) {
      setPathHistory(h => h.slice(0, -1));
      loadFiles(prev);
    }
  };

  const handleDelete = (file: PuterFile) => {
    if (storagePermission !== 'full') {
      showAlert('Permission Denied', 'You need Full Access permission to delete files.');
      return;
    }
    showAlert(
      'Delete File',
      `Delete "${file.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!token) return;
            try {
              await puterDeleteFile(file.path, token);
              setFiles(prev => prev.filter(f => f.id !== file.id));
            } catch (err: any) {
              showAlert('Error', err.message);
            }
          },
        },
      ]
    );
  };

  const handleCreateFolder = async () => {
    if (!newName.trim() || !token) return;
    try {
      await puterCreateFolder(`${path}/${newName.trim()}`, token);
      setShowNewFolderModal(false);
      setNewName('');
      loadFiles(path);
    } catch (err: any) {
      showAlert('Error', err.message);
    }
  };

  const handleCreateFile = async () => {
    if (!newName.trim() || !token) return;
    try {
      await puterWriteFile(`${path}/${newName.trim()}`, newContent, token);
      setShowNewFileModal(false);
      setNewName('');
      setNewContent('');
      loadFiles(path);
    } catch (err: any) {
      showAlert('Error', err.message);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '—';
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / 1048576).toFixed(1)}MB`;
  };

  const currentPerm = PERMISSION_LEVELS.find(p => p.key === storagePermission)!;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {pathHistory.length > 0 && (
            <Pressable onPress={goBack} hitSlop={8}>
              <MaterialIcons name="arrow-back" size={22} color={Colors.textSecondary} />
            </Pressable>
          )}
          <View>
            <Text style={styles.headerTitle}>Files</Text>
            <Text style={styles.headerPath} numberOfLines={1}>{path}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          {/* Permission Badge */}
          <Pressable
            style={[styles.permBadge, { borderColor: currentPerm.color + '66' }]}
            onPress={() => setShowPermModal(true)}
            hitSlop={4}
          >
            <MaterialIcons name={currentPerm.icon} size={12} color={currentPerm.color} />
            <Text style={[styles.permBadgeText, { color: currentPerm.color }]}>
              {currentPerm.label}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Toolbar */}
      {storagePermission !== 'none' && token && (
        <View style={styles.toolbar}>
          <Pressable
            style={({ pressed }) => [styles.toolbarBtn, pressed && { opacity: 0.7 }]}
            onPress={() => loadFiles(path)}
          >
            <MaterialIcons name="refresh" size={16} color={Colors.textSecondary} />
            <Text style={styles.toolbarText}>Refresh</Text>
          </Pressable>
          {storagePermission === 'full' && (
            <>
              <Pressable
                style={({ pressed }) => [styles.toolbarBtn, pressed && { opacity: 0.7 }]}
                onPress={() => setShowNewFolderModal(true)}
              >
                <MaterialIcons name="create-new-folder" size={16} color={Colors.accent} />
                <Text style={[styles.toolbarText, { color: Colors.accent }]}>Folder</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.toolbarBtn, pressed && { opacity: 0.7 }]}
                onPress={() => setShowNewFileModal(true)}
              >
                <MaterialIcons name="note-add" size={16} color={Colors.primary} />
                <Text style={[styles.toolbarText, { color: Colors.primary }]}>New File</Text>
              </Pressable>
            </>
          )}
        </View>
      )}

      {/* Content */}
      {storagePermission === 'none' ? (
        <View style={styles.empty}>
          <MaterialIcons name="lock" size={64} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>Storage Locked</Text>
          <Text style={styles.emptySub}>Grant storage permission to access your Puter files.</Text>
          <Pressable
            style={({ pressed }) => [styles.grantBtn, pressed && { opacity: 0.8 }]}
            onPress={() => setShowPermModal(true)}
          >
            <MaterialIcons name="lock-open" size={16} color={Colors.bg} />
            <Text style={styles.grantBtnText}>Grant Permission</Text>
          </Pressable>
        </View>
      ) : !token ? (
        <View style={styles.empty}>
          <MaterialIcons name="cloud-off" size={64} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>Not Connected</Text>
          <Text style={styles.emptySub}>Login with Puter to access your cloud files.</Text>
        </View>
      ) : files.length === 0 && !loading ? (
        <View style={styles.empty}>
          <MaterialIcons name="folder-open" size={64} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No files loaded</Text>
          <Text style={styles.emptySub}>Tap Refresh to load files from Puter storage.</Text>
          <Pressable
            style={({ pressed }) => [styles.grantBtn, pressed && { opacity: 0.8 }]}
            onPress={() => loadFiles(path)}
          >
            <MaterialIcons name="folder" size={16} color={Colors.bg} />
            <Text style={styles.grantBtnText}>Load Files</Text>
          </Pressable>
        </View>
      ) : loading ? (
        <View style={styles.empty}>
          <ActivityIndicator color={Colors.primary} size="large" />
          <Text style={styles.loadingText}>Loading files...</Text>
        </View>
      ) : (
        <FlatList
          data={files}
          keyExtractor={f => f.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.fileRow, pressed && { opacity: 0.8 }]}
              onPress={() => {
                if (item.is_dir) navigateTo(item.path);
              }}
            >
              <MaterialIcons
                name={item.is_dir ? 'folder' : 'insert-drive-file'}
                size={28}
                color={item.is_dir ? Colors.warning : Colors.textSecondary}
              />
              <View style={styles.fileInfo}>
                <Text style={styles.fileName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.fileMeta}>
                  {item.is_dir ? 'Folder' : formatSize(item.size)}
                  {' · '}
                  {new Date(item.modified).toLocaleDateString()}
                </Text>
              </View>
              {storagePermission === 'full' && !item.is_dir && (
                <Pressable onPress={() => handleDelete(item)} hitSlop={8}>
                  <MaterialIcons name="delete-outline" size={20} color={Colors.danger + 'aa'} />
                </Pressable>
              )}
              {item.is_dir && (
                <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />
              )}
            </Pressable>
          )}
        />
      )}

      {/* Permission Modal */}
      <Modal visible={showPermModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { paddingBottom: insets.bottom + 16 }]}>
            <Text style={styles.modalTitle}>Storage Permission</Text>
            <Text style={styles.modalSub}>Choose the level of access Codex has to your Puter storage.</Text>
            {PERMISSION_LEVELS.map(p => (
              <Pressable
                key={p.key}
                style={({ pressed }) => [
                  styles.permOption,
                  storagePermission === p.key && styles.permOptionActive,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() => {
                  setStoragePermission(p.key as any);
                  setShowPermModal(false);
                }}
              >
                <MaterialIcons name={p.icon} size={24} color={p.color} />
                <View style={styles.permOptionText}>
                  <Text style={[styles.permOptionLabel, { color: p.color }]}>{p.label}</Text>
                  <Text style={styles.permOptionDesc}>{p.desc}</Text>
                </View>
                {storagePermission === p.key && (
                  <MaterialIcons name="check-circle" size={20} color={p.color} />
                )}
              </Pressable>
            ))}
            <Pressable
              style={({ pressed }) => [styles.modalCloseBtn, pressed && { opacity: 0.7 }]}
              onPress={() => setShowPermModal(false)}
            >
              <Text style={styles.modalCloseBtnText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* New Folder Modal */}
      <Modal visible={showNewFolderModal} transparent animationType="slide">
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={[styles.modalCard, { paddingBottom: insets.bottom + 16 }]}>
            <Text style={styles.modalTitle}>New Folder</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Folder name..."
              placeholderTextColor={Colors.textMuted}
              value={newName}
              onChangeText={setNewName}
              autoFocus
            />
            <View style={styles.modalBtns}>
              <Pressable style={styles.modalCancelBtn} onPress={() => { setShowNewFolderModal(false); setNewName(''); }}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalConfirmBtn} onPress={handleCreateFolder}>
                <Text style={styles.modalConfirmText}>Create</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* New File Modal */}
      <Modal visible={showNewFileModal} transparent animationType="slide">
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={[styles.modalCard, { paddingBottom: insets.bottom + 16 }]}>
            <Text style={styles.modalTitle}>New File</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="File name (e.g. notes.txt)..."
              placeholderTextColor={Colors.textMuted}
              value={newName}
              onChangeText={setNewName}
              autoFocus
            />
            <TextInput
              style={[styles.modalInput, { height: 100, textAlignVertical: 'top' }]}
              placeholder="File content..."
              placeholderTextColor={Colors.textMuted}
              value={newContent}
              onChangeText={setNewContent}
              multiline
            />
            <View style={styles.modalBtns}>
              <Pressable style={styles.modalCancelBtn} onPress={() => { setShowNewFileModal(false); setNewName(''); setNewContent(''); }}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalConfirmBtn} onPress={handleCreateFile}>
                <Text style={styles.modalConfirmText}>Create</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
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
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  headerTitle: { fontSize: Font.xl, fontWeight: '700', color: Colors.textPrimary },
  headerPath: { fontSize: Font.xs, color: Colors.textMuted, maxWidth: 180 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  permBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, backgroundColor: Colors.surface,
  },
  permBadgeText: { fontSize: Font.xs, fontWeight: '600' },
  toolbar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface + 'aa',
  },
  toolbarBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  toolbarText: { fontSize: Font.sm, color: Colors.textSecondary },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  emptyTitle: { fontSize: Font.xl, fontWeight: '700', color: Colors.textPrimary, marginTop: Spacing.md, marginBottom: Spacing.sm },
  emptySub: { fontSize: Font.md, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.lg },
  grantBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
  },
  grantBtnText: { color: Colors.bg, fontWeight: '700', fontSize: Font.md },
  loadingText: { fontSize: Font.md, color: Colors.textSecondary, marginTop: Spacing.md },
  list: { padding: Spacing.md, gap: Spacing.sm },
  fileRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.card, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border, padding: Spacing.md,
  },
  fileInfo: { flex: 1 },
  fileName: { fontSize: Font.md, fontWeight: '500', color: Colors.textPrimary, marginBottom: 2 },
  fileMeta: { fontSize: Font.xs, color: Colors.textMuted },
  modalOverlay: {
    flex: 1, backgroundColor: '#000000aa',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
    borderWidth: 1, borderBottomWidth: 0, borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  modalTitle: { fontSize: Font.xl, fontWeight: '700', color: Colors.textPrimary },
  modalSub: { fontSize: Font.sm, color: Colors.textSecondary, lineHeight: 20 },
  permOption: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.card, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.md,
  },
  permOptionActive: { borderColor: Colors.primary + '66', backgroundColor: Colors.primaryDim },
  permOptionText: { flex: 1 },
  permOptionLabel: { fontSize: Font.md, fontWeight: '700', marginBottom: 2 },
  permOptionDesc: { fontSize: Font.sm, color: Colors.textSecondary },
  modalCloseBtn: {
    height: 48, alignItems: 'center', justifyContent: 'center',
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border,
  },
  modalCloseBtnText: { fontSize: Font.md, color: Colors.textSecondary, fontWeight: '600' },
  modalInput: {
    backgroundColor: Colors.card, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2,
    color: Colors.textPrimary, fontSize: Font.md,
  },
  modalBtns: { flexDirection: 'row', gap: Spacing.md },
  modalCancelBtn: {
    flex: 1, height: 48, alignItems: 'center', justifyContent: 'center',
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border,
  },
  modalCancelText: { color: Colors.textSecondary, fontWeight: '600', fontSize: Font.md },
  modalConfirmBtn: {
    flex: 1, height: 48, alignItems: 'center', justifyContent: 'center',
    borderRadius: Radius.md, backgroundColor: Colors.primary,
  },
  modalConfirmText: { color: Colors.bg, fontWeight: '700', fontSize: Font.md },
});
