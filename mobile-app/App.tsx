// Import polyfills first
import './src/polyfills';

import React, { useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { SolanaProvider, showFeedback } from './src/context';
import { WalletConnect, Balance, SendTransaction } from './src/components';
import { TransactionHistory } from './src/components/transaction/TransactionHistory';
import { theme } from './src/config/theme';
import { APP_NAME, APP_VERSION, CLUSTER } from './src/config/constants';
import { useWallet, useBalance } from './src/hooks';
import { useWalletStore, selectTransactions } from './src/store';

 
// Main App Content (uses Zustand + TanStack Query)
 

function AppContent() {
  // Zustand store for wallet state
  const {
    publicKey,
    connected,
    loading: walletLoading,
  } = useWalletStore();
  
  const transactions = useWalletStore(selectTransactions);
  
  // TanStack Query for balance
  const { balance, isFetching: balanceFetching, refresh: refreshBalance } = useBalance();
  
  // Wallet actions
  const {
    connectWallet,
    disconnectWallet,
    sendTransaction,
    requestAirdrop,
    formatAddress,
    isSending,
    isAirdropping,
  } = useWallet();

  const loading = walletLoading || balanceFetching || isSending || isAirdropping;

  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    await refreshBalance();
  }, [refreshBalance]);

  // Handle wallet connection
  const handleConnect = useCallback(async () => {
    try {
      const success = await connectWallet();
      if (!success) {
        showFeedback('Could not connect to wallet. Please make sure Phantom is installed.', 'error');
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error occurred';
      showFeedback(errorMessage, 'error');
    }
  }, [connectWallet]);

  // Handle airdrop request
  const handleAirdrop = useCallback(async () => {
    try {
      const result = await requestAirdrop(1);
      if (result.success) {
        showFeedback('Received 1 SOL from devnet faucet!', 'success');
      } else {
        showFeedback(result.error || 'Airdrop failed', 'error');
      }
    } catch (error: any) {
      showFeedback(error?.message || 'Airdrop failed', 'error');
    }
  }, [requestAirdrop]);

  // Handle send transaction
  const handleSend = useCallback(async (recipient: string, amount: number) => {
    try {
      const result = await sendTransaction(recipient, amount);
      if (result.success) {
        showFeedback('Transaction sent successfully!', 'success');
      } else {
        showFeedback(result.error || 'Transaction failed', 'error');
      }
      return result;
    } catch (error: any) {
      showFeedback(error?.message || 'Transaction failed', 'error');
      return { signature: '', success: false, error: error?.message };
    }
  }, [sendTransaction]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            connected ? (
              <RefreshControl
                refreshing={balanceFetching}
                onRefresh={onRefresh}
                tintColor={theme.colors.secondary.main}
                colors={[theme.colors.secondary.main]}
              />
            ) : undefined
          }
        >
          {/* Header Section with Gradient Blob */}
          <View style={styles.headerContainer}>
            <LinearGradient
              colors={theme.colors.gradients.vibrant}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerGradient}
            />
            <View style={styles.headerContent}>
              <View style={styles.logoBadge}>
                <Text style={styles.logoText}>◎</Text>
              </View>
              <Text style={styles.title}>{APP_NAME}</Text>
              <View style={styles.networkTag}>
                <View style={styles.networkDot} />
                <Text style={styles.networkText}>{CLUSTER.toUpperCase()}</Text>
              </View>
            </View>
          </View>

          <View style={styles.mainContent}>
            {/* Connection View */}
            <View style={styles.section}>
              <WalletConnect
                connected={connected}
                publicKey={publicKey}
                loading={walletLoading && !connected}
                onConnect={handleConnect}
                onDisconnect={disconnectWallet}
                formatAddress={formatAddress}
                variant={connected ? 'glass' : 'default'}
              />
            </View>

            {/* Wallet Features (only when connected) */}
            {connected && (
              <View style={styles.featuresList}>
                <View style={styles.section}>
                  <Balance
                    balance={balance}
                    loading={balanceFetching}
                    onRefresh={refreshBalance}
                    onRequestAirdrop={handleAirdrop}
                  />
                </View>

                <View style={styles.section}>
                  <SendTransaction
                    balance={balance}
                    loading={isSending}
                    onSend={handleSend}
                  />
                </View>

                <View style={[styles.section, { marginBottom: 100 }]}>
                  <TransactionHistory
                    transactions={transactions}
                    loading={loading}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Secure Wallet Connect • Solana Devnet</Text>
            <Text style={styles.footerVersion}>v{APP_VERSION}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

 
// Root App Component (with Provider)
 

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SolanaProvider>
          <AppContent />
        </SolanaProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

 
// Styles
 

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerContainer: {
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headerGradient: {
    position: 'absolute',
    top: -100,
    width: '120%',
    height: 350,
    borderBottomLeftRadius: 300,
    borderBottomRightRadius: 300,
    opacity: 0.2,
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.primary.main,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.lg,
  },
  logoText: {
    fontSize: 42,
    color: theme.colors.primary.main,
  },
  title: {
    fontSize: 32,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
    marginBottom: theme.spacing.md,
  },
  networkTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 241, 149, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.secondary.main,
  },
  networkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.secondary.main,
    marginRight: 8,
  },
  networkText: {
    color: theme.colors.secondary.main,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  mainContent: {
    paddingHorizontal: theme.spacing.xl,
    marginTop: -20,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  featuresList: {
    marginTop: theme.spacing.sm,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: theme.spacing.xl,
  },
  footerText: {
    color: theme.colors.text.tertiary,
    fontSize: 12,
    fontWeight: '500',
  },
  footerVersion: {
    color: theme.colors.text.tertiary,
    fontSize: 10,
    marginTop: 4,
  },
});
