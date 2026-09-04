// src/components/ui/ToastContainer.tsx
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUIStore } from '@/store/uiStore';
import { useTheme } from '@/hooks/useTheme';

export const ToastContainer = () => {
  const insets = useSafeAreaInsets();
  const { toasts, hideToast } = useUIStore();
  const { colors, isDark, isRTL } = useTheme();

  if (toasts.length === 0) return null;

  return (
    <View style={[styles.container, { top: insets.top + 8 }]} pointerEvents="box-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => hideToast(toast.id)} colors={colors} isRTL={isRTL} />
      ))}
    </View>
  );
};

const ToastItem = ({
  toast,
  onDismiss,
  colors,
  isRTL,
}: {
  toast: { id: string; type: string; message: string; action?: { label: string; onPress: () => void } };
  onDismiss: () => void;
  colors: any;
  isRTL: boolean;
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return { name: 'checkmark-circle' as const, color: '#16A34A' };
      case 'error':
        return { name: 'alert-circle' as const, color: '#DC2626' };
      case 'quota_exceeded':
        return { name: 'sparkles' as const, color: '#C8922A' };
      default:
        return { name: 'information-circle' as const, color: '#2563EB' };
    }
  };

  const iconInfo = getIcon();

  return (
    <View
      style={[
        styles.toastCard,
        {
          backgroundColor: colors.surfaceContainerHighest || colors.surface,
          borderColor: colors.outlineVariant + '44',
        },
      ]}
    >
      <Ionicons name={iconInfo.name} size={20} color={iconInfo.color} style={styles.icon} />
      <Text style={[styles.message, { color: colors.onSurface }]} numberOfLines={3}>
        {toast.message}
      </Text>
      {toast.action && (
        <TouchableOpacity onPress={toast.action.onPress} style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>{toast.action.label}</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={onDismiss} style={styles.closeBtn} activeOpacity={0.6}>
        <Ionicons name="close" size={16} color={colors.onSurfaceVariant} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: 'center',
    gap: 8,
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 480,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  icon: {
    marginRight: 10,
  },
  message: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  actionBtn: {
    backgroundColor: '#C8922A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 4,
    marginLeft: 6,
  },
});
