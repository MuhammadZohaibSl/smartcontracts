import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Button, Card } from './common';
import { theme } from '../config/theme';

interface WalletConnectProps {
  connected: boolean;
  publicKey: string | null;
  loading: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  formatAddress: (address: string) => string;
  variant?: 'default' | 'glass';
}

export function WalletConnect({
  connected,
  publicKey,
  loading,
  onConnect,
  onDisconnect,
  formatAddress,
  variant = 'default',
}: WalletConnectProps) {
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [connected]);

  if (loading && !connected) {
    return (
      <Card variant={variant} padding="3xl" style={styles.loadingCard}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
        <Text style={styles.loadingText}>Handshaking with Phantom...</Text>
      </Card>
    );
  }

  if (connected && publicKey) {
    return (
      <Animated.View style={{ opacity: fadeAnim }}>
        <Card variant="glass" padding="xl" style={styles.connectedCard}>
          <View style={styles.headerRow}>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>ACTIVE</Text>
            </View>
            <Button
              title="Disconnect"
              onPress={onDisconnect}
              variant="ghost"
              size="sm"
              textStyle={styles.disconnectText}
            />
          </View>
          
          <View style={styles.addressWrapper}>
            <Text style={styles.addressLabel}>PRIMARY ACCOUNT</Text>
            <View style={styles.addressContainer}>
              <Text style={styles.address}>{formatAddress(publicKey)}</Text>
              <View style={styles.solBadge}>
                <Text style={styles.solBadgeText}>SOL</Text>
              </View>
            </View>
          </View>
        </Card>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Card variant="default" padding="3xl" style={styles.connectCard}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>✦</Text>
        </View>
        
        <Text style={styles.title}>Secure Connect</Text>
        <Text style={styles.subtitle}>
          Link your Phantom wallet to manage balances and send transactions securely.
        </Text>
        
        <Button
          title="Open Phantom"
          onPress={onConnect}
          variant="vibrant"
          fullWidth
          size="lg"
        />
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  loadingCard: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  loadingText: {
    color: theme.colors.text.secondary,
    fontSize: 16,
    fontWeight: '500',
    marginTop: 20,
    letterSpacing: 0.5,
  },
  connectCard: {
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconText: {
    fontSize: 32,
    color: theme.colors.primary.main,
  },
  title: {
    fontSize: 24,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  connectedCard: {
    borderWidth: 1,
    borderColor: 'rgba(20, 241, 149, 0.2)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 241, 149, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.secondary.main,
    marginRight: 6,
  },
  statusText: {
    color: theme.colors.secondary.main,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  disconnectText: {
    color: theme.colors.status.error,
    fontSize: 12,
  },
  addressWrapper: {
    marginTop: 8,
  },
  addressLabel: {
    color: theme.colors.text.tertiary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 12,
  },
  address: {
    color: theme.colors.text.primary,
    fontSize: 18,
    fontWeight: '600',
    fontFamily: theme.typography.fontFamily.mono,
  },
  solBadge: {
    backgroundColor: theme.colors.primary.light,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  solBadgeText: {
    color: theme.colors.primary.main,
    fontSize: 10,
    fontWeight: 'bold',
  },
});
