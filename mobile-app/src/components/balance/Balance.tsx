import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Button, Card } from '../common';
import { theme } from '../../config/theme';

interface BalanceProps {
  balance: number;
  loading: boolean;
  onRefresh: () => void;
  onRequestAirdrop: () => void;
}

export function Balance({
  balance,
  loading,
  onRefresh,
  onRequestAirdrop,
}: BalanceProps) {
  return (
    <Card variant="glass" padding="xl" style={styles.card}>
      <View style={styles.header}>
        <View style={styles.labelWrapper}>
          <Text style={styles.label}>NET WORTH</Text>
          <View style={styles.tokenBadge}>
            <Text style={styles.tokenText}>SOLANA</Text>
          </View>
        </View>
        <Button
          title="Refresh"
          onPress={onRefresh}
          variant="ghost"
          size="sm"
          leftIcon={<Text style={styles.refreshIcon}>↻</Text>}
          textStyle={styles.refreshText}
          loading={loading}
        />
      </View>
      
      <View style={styles.balanceContainer}>
        <View style={styles.balanceRow}>
          {loading ? (
            <ActivityIndicator size="large" color={theme.colors.primary.main} />
          ) : (
            <React.Fragment>
              <Text style={styles.balance}>{balance.toFixed(4)}</Text>
              <Text style={styles.currency}>SOL</Text>
            </React.Fragment>
          )}
        </View>
        
        <View style={styles.usdValue}>
          <Text style={styles.usdText}>
            ≈ ${(balance * 105.42).toFixed(2)} USD
          </Text>
          <View style={styles.trendBadge}>
            <Text style={styles.trendText}>+2.45%</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.actionRow}>
        <Button
          title="Get Devnet SOL"
          onPress={onRequestAirdrop}
          variant="secondary"
          size="md"
          fullWidth
          leftIcon={<Text style={styles.airdropIcon}>💧</Text>}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  labelWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    color: theme.colors.text.tertiary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  tokenBadge: {
    backgroundColor: 'rgba(153, 69, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tokenText: {
    color: theme.colors.primary.main,
    fontSize: 8,
    fontWeight: 'bold',
  },
  refreshIcon: {
    fontSize: 16,
    color: theme.colors.primary.main,
    marginRight: 4,
  },
  refreshText: {
    color: theme.colors.primary.main,
    fontSize: 12,
  },
  balanceContainer: {
    marginVertical: 4,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  balance: {
    fontSize: 48,
    fontWeight: '800',
    color: theme.colors.text.primary,
    letterSpacing: -1,
  },
  currency: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary.main,
    marginLeft: 8,
    opacity: 0.9,
  },
  usdValue: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  usdText: {
    color: theme.colors.text.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
  trendBadge: {
    backgroundColor: 'rgba(20, 241, 149, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  trendText: {
    color: theme.colors.secondary.main,
    fontSize: 10,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 24,
  },
  actionRow: {
    marginTop: 4,
  },
  airdropIcon: {
    fontSize: 16,
  },
});
