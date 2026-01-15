/**
 * Transaction History Component
 * 
 * Displays recent transaction history with links to Solana Explorer.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  FlatList,
} from 'react-native';
import { Card } from '../common';
import { colors, typography, spacing, borderRadius } from '../../config/theme';
import { getExplorerUrl } from '../../config/constants';
import { formatSignature, formatRelativeTime, formatBalance } from '../../utils/formatters';
import { TransactionRecord, TransactionType, TransactionStatus } from '../../types';

 
// Types
 

interface TransactionHistoryProps {
  /** Array of transaction records */
  transactions: TransactionRecord[];
  /** Whether data is loading */
  loading?: boolean;
  /** Maximum transactions to display */
  maxItems?: number;
}

 
// Helper Components
 

function TransactionIcon({ type }: { type: TransactionType }) {
  const icons: Record<TransactionType, string> = {
    [TransactionType.TRANSFER]: '↗️',
    [TransactionType.AIRDROP]: '💧',
    [TransactionType.PROGRAM_CALL]: '⚡',
  };

  return <Text style={styles.icon}>{icons[type]}</Text>;
}

function StatusBadge({ status }: { status: TransactionStatus }) {
  const statusStyles: Record<TransactionStatus, { color: string; label: string }> = {
    [TransactionStatus.PENDING]: { color: colors.status.warning, label: 'Pending' },
    [TransactionStatus.CONFIRMED]: { color: colors.status.success, label: 'Confirmed' },
    [TransactionStatus.FINALIZED]: { color: colors.secondary.main, label: 'Finalized' },
    [TransactionStatus.FAILED]: { color: colors.status.error, label: 'Failed' },
  };

  const { color, label } = statusStyles[status];

  return (
    <View style={[styles.statusBadge, { backgroundColor: `${color}20` }]}>
      <View style={[styles.statusDot, { backgroundColor: color }]} />
      <Text style={[styles.statusText, { color }]}>{label}</Text>
    </View>
  );
}

 
// Main Component
 

export function TransactionHistory({
  transactions,
  loading = false,
  maxItems = 5,
}: TransactionHistoryProps) {
  const displayedTransactions = transactions.slice(0, maxItems);

  const openExplorer = (signature: string) => {
    const url = getExplorerUrl('tx', signature);
    Linking.openURL(url);
  };

  const renderTransaction = ({ item }: { item: TransactionRecord }) => (
    <TouchableOpacity
      style={styles.transactionRow}
      onPress={() => openExplorer(item.signature)}
      activeOpacity={0.7}
    >
      <TransactionIcon type={item.type} />
      
      <View style={styles.transactionDetails}>
        <View style={styles.transactionHeader}>
          <Text style={styles.transactionType}>
            {item.type === TransactionType.TRANSFER ? 'Sent' : 
             item.type === TransactionType.AIRDROP ? 'Airdrop' : 'Program Call'}
          </Text>
          {item.amount !== undefined && (
            <Text style={styles.amount}>
              {item.type === TransactionType.AIRDROP ? '+' : '-'}
              {formatBalance(item.amount, 4)} SOL
            </Text>
          )}
        </View>
        
        <View style={styles.transactionMeta}>
          <Text style={styles.signature}>
            {formatSignature(item.signature, 20)}
          </Text>
          <Text style={styles.timestamp}>
            {formatRelativeTime(item.timestamp)}
          </Text>
        </View>
        
        <StatusBadge status={item.status} />
      </View>
    </TouchableOpacity>
  );

  if (displayedTransactions.length === 0 && !loading) {
    return (
      <Card style={styles.container}>
        <Text style={styles.title}>Recent Activity</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>No transactions yet</Text>
          <Text style={styles.emptySubtext}>
            Your transaction history will appear here
          </Text>
        </View>
      </Card>
    );
  }

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Activity</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={displayedTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.signature}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </Card>
  );
}

 
// Styles
 

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  
  viewAll: {
    fontSize: typography.fontSize.md,
    color: colors.primary.main,
    fontWeight: typography.fontWeight.medium,
  },
  
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
  },
  
  icon: {
    fontSize: 24,
    marginRight: spacing.md,
    marginTop: spacing.xs,
  },
  
  transactionDetails: {
    flex: 1,
  },
  
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  
  transactionType: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  
  amount: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  
  transactionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  
  signature: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontFamily: typography.fontFamily.mono,
  },
  
  timestamp: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.xs,
  },
  
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  
  separator: {
    height: 1,
    backgroundColor: colors.border.primary,
  },
  
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  
  emptyText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  
  emptySubtext: {
    fontSize: typography.fontSize.md,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});
