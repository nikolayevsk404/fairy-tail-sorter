import { memo } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';

export const MagicalBackground = memo(function MagicalBackground() {
  return (
    <ImageBackground
      source={require('../assets/wallpaper.png')}
      resizeMode="cover"
      style={StyleSheet.absoluteFill}
      imageStyle={styles.image}
    >
      <View style={styles.overlay} />
    </ImageBackground>
  );
});

const styles = StyleSheet.create({
  image: {
    opacity: 0.96,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 7, 25, 0.38)',
  },
});
