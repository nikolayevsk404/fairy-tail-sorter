import { StyleSheet, Text, View } from 'react-native';

export function CompletionBurst() {
  const stars = ['✨', '🌟', '💫', '✨', '⭐'];

  return (
    <View style={styles.overlay} pointerEvents="none">
      <View style={styles.card}>
        <Text style={styles.title}>Todos foram sorteados ✨</Text>
        <View style={styles.row}>
          {stars.map((star, index) => (
            <Text key={`${star}-${index}`} style={styles.star}>
              {star}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    minWidth: 260,
    borderRadius: 28,
    paddingHorizontal: 28,
    paddingVertical: 24,
    backgroundColor: 'rgba(255, 250, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
  },
  row: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
  },
  star: {
    fontSize: 24,
  },
});
