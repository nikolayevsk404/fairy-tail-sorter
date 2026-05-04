import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { DrawMode } from '../utils/types';
import { theme } from '../utils/theme';
import { sanitizeDrawMode } from '../utils/lottery';

const options: Array<{ mode: DrawMode; label: string }> = [
  { mode: 1, label: '1' },
  { mode: 2, label: '2' },
  { mode: 3, label: '3' },
  { mode: 4, label: '4' },
];

type ModeSelectorProps = {
  value: DrawMode;
  onChange: (mode: DrawMode) => void;
};

export function ModeSelector({ value, onChange }: ModeSelectorProps) {
  const customValue = value > 4 ? String(value) : '';

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        {options.map((option) => {
          const active = option.mode === value;

          return (
            <Pressable key={option.mode} onPress={() => onChange(option.mode)} style={[styles.option, active && styles.active]}>
              <Text style={[styles.label, active && styles.activeLabel]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.customRow}>
        <Text style={styles.customLabel}>Ou escolha outro tamanho</Text>
        <TextInput
          value={customValue}
          onChangeText={(text) => {
            const digits = text.replace(/\D+/g, '');
            if (!digits) {
              return;
            }
            onChange(sanitizeDrawMode(Number(digits)));
          }}
          keyboardType="number-pad"
          placeholder="Ex.: 5"
          placeholderTextColor="rgba(255,255,255,0.35)"
          style={[styles.customInput, value > 4 && styles.customInputActive]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  option: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  active: {
    backgroundColor: 'rgba(255,114,203,0.25)',
    borderColor: theme.colors.pinkSoft,
    shadowColor: theme.colors.pink,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  activeLabel: {
    color: theme.colors.text,
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  customLabel: {
    flex: 1,
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  customInput: {
    minWidth: 88,
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    color: theme.colors.text,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '800',
    paddingHorizontal: 12,
  },
  customInputActive: {
    borderColor: theme.colors.pinkSoft,
    backgroundColor: 'rgba(255,114,203,0.18)',
  },
});
