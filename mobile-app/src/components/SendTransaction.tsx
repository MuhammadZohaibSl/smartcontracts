import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Button, Card, Input } from './common';
import { theme } from '../config/theme';

interface TransactionResult {
  signature: string;
  success: boolean;
  error?: string;
}

interface SendTransactionProps {
  balance: number;
  loading: boolean;
  onSend: (recipient: string, amount: number) => Promise<TransactionResult>;
}

export function SendTransaction({
  balance,
  loading,
  onSend,
}: SendTransactionProps) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [sending, setSending] = useState(false);
  const [lastTx, setLastTx] = useState<string | null>(null);

  const handleSend = async () => {
    Keyboard.dismiss();

    const amountNum = parseFloat(amount);
    setSending(true);
    const result = await onSend(recipient.trim(), amountNum);
    setSending(false);

    if (result.success) {
      setLastTx(result.signature);
      setRecipient('');
      setAmount('');
    }
  };

  const setMaxAmount = () => {
    const maxAmount = Math.max(0, balance - 0.00001);
    setAmount(maxAmount.toString());
  };

  const isButtonDisabled = loading || sending || !recipient || !amount || parseFloat(amount) <= 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Card variant="glass" padding="xl" style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Send Funds</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>INSTANT</Text>
          </View>
        </View>
        
        <Input
          label="RECIPIENT ADDRESS"
          placeholder="Enter Solana address..."
          value={recipient}
          onChangeText={setRecipient}
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        <Input
          label="AMOUNT"
          placeholder="0.00"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          rightElement={
            <Button
              title="MAX"
              onPress={setMaxAmount}
              variant="ghost"
              size="sm"
              textStyle={styles.maxButtonText}
            />
          }
          helperText={`Balance: ${balance.toFixed(4)} SOL`}
        />
        
        {amount && parseFloat(amount) > 0 && (
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Estimated Fee</Text>
              <Text style={styles.summaryValue}>0.000005 SOL</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total to Send</Text>
              <Text style={styles.totalValue}>{amount} SOL</Text>
            </View>
          </View>
        )}
        
        <Button
          title={sending ? "Transacting..." : "Send Transaction"}
          onPress={handleSend}
          variant="primary"
          fullWidth
          size="lg"
          disabled={isButtonDisabled}
          loading={sending}
          style={styles.sendButton}
        />

        {lastTx && (
          <View style={styles.successBox}>
            <Text style={styles.successLabel}>LAST TRANSACTION ID</Text>
            <Text style={styles.signature} numberOfLines={1} ellipsizeMode="middle">
              {lastTx}
            </Text>
          </View>
        )}
      </Card>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  card: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 20,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
  },
  badge: {
    backgroundColor: 'rgba(153, 69, 255, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  badgeText: {
    color: theme.colors.primary.main,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  maxButtonText: {
    color: theme.colors.secondary.main,
    fontSize: 12,
    fontWeight: 'bold',
  },
  summaryBox: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: theme.borderRadius.md,
    padding: 18,
    marginTop: 8,
    marginBottom: 8,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    color: theme.colors.text.tertiary,
    fontSize: 12,
    fontWeight: '500',
  },
  summaryValue: {
    color: theme.colors.text.secondary,
    fontSize: 12,
    fontWeight: '600',
  },
  totalValue: {
    color: theme.colors.secondary.main,
    fontSize: 14,
    fontWeight: 'bold',
  },
  sendButton: {
    marginTop: 16,
  },
  successBox: {
    marginTop: 20,
    padding: 12,
    backgroundColor: 'rgba(20, 241, 149, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(20, 241, 149, 0.1)',
  },
  successLabel: {
    color: theme.colors.secondary.main,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 4,
  },
  signature: {
    color: theme.colors.text.secondary,
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.mono,
  },
});
