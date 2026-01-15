/**
 * Phantom Deep Linking Service (with Encryption)
 *
 * Provides wallet connection via deep links for Expo Go compatibility.
 * Implements proper encryption as required by Phantom's protocol.
 */

import * as Linking from 'expo-linking';
import { PublicKey, Transaction } from '@solana/web3.js';
import bs58 from 'bs58';
import { Buffer } from 'buffer';
import { Platform, Alert } from 'react-native';
import nacl from 'tweetnacl';

 
// Types
 

export interface DeepLinkConnectionResult {
  publicKey: string;
  session: string;
}

export interface DeepLinkSignResult {
  signature: string;
}

interface DappKeyPair {
  publicKey: Uint8Array;
  secretKey: Uint8Array;
}

 
// Service Implementation
 

/**
 * Service to handle Phantom Deep Linking with proper encryption
 */
export class PhantomDeepLinkService {
  private static readonly PHANTOM_BASE_URL = 'https://phantom.app/ul/v1/';
  private static readonly APP_URL = 'https://solanacointransfer.app';
  
  // Store the dapp keypair for this session
  private static dappKeyPair: DappKeyPair | null = null;
  private static sharedSecret: Uint8Array | null = null;
  private static phantomPublicKey: Uint8Array | null = null;

  /**
   * Generate or get the dapp encryption keypair
   */
  private static getDappKeyPair(): DappKeyPair {
    if (!this.dappKeyPair) {
      // Generate a new X25519 keypair for encryption
      this.dappKeyPair = nacl.box.keyPair();
      console.log('Generated new dapp keypair');
    }
    return this.dappKeyPair;
  }

  /**
   * Create a shared secret from Phantom's public key
   */
  private static createSharedSecret(phantomPublicKeyBase58: string): Uint8Array {
    const keypair = this.getDappKeyPair();
    const phantomPubKey = bs58.decode(phantomPublicKeyBase58);
    this.phantomPublicKey = phantomPubKey;
    this.sharedSecret = nacl.box.before(phantomPubKey, keypair.secretKey);
    return this.sharedSecret;
  }

  /**
   * Decrypt a message from Phantom
   */
  private static decryptPayload(
    data: string,
    nonce: string,
    sharedSecret: Uint8Array
  ): any {
    const decryptedData = nacl.box.open.after(
      bs58.decode(data),
      bs58.decode(nonce),
      sharedSecret
    );
    
    if (!decryptedData) {
      throw new Error('Failed to decrypt payload');
    }
    
    const jsonString = Buffer.from(decryptedData).toString('utf8');
    return JSON.parse(jsonString);
  }

  /**
   * Check if Phantom is installed on the device
   */
  static async isPhantomInstalled(): Promise<boolean> {
    try {
      const canOpenUniversal = await Linking.canOpenURL('https://phantom.app/ul/v1/connect');
      if (canOpenUniversal) return true;
      
      if (Platform.OS === 'android') {
        const canOpenPhantom = await Linking.canOpenURL('phantom://');
        return canOpenPhantom;
      }
      
      return false;
    } catch (error) {
      console.warn('Error checking Phantom installation:', error);
      return false;
    }
  }

  /**
   * Get the Phantom app store URL for installation
   */
  static getPhantomInstallUrl(): string {
    if (Platform.OS === 'android') {
      return 'https://play.google.com/store/apps/details?id=app.phantom';
    }
    return 'https://apps.apple.com/app/phantom-solana-wallet/id1598432977';
  }

  /**
   * Connect to Phantom via Deep Link with proper encryption
   */
  static async connect(redirectUrl: string): Promise<void> {
    // Get or generate keypair
    const keypair = this.getDappKeyPair();
    const dappPublicKeyBase58 = bs58.encode(keypair.publicKey);
    
    const params = new URLSearchParams({
      app_url: this.APP_URL,
      dapp_encryption_public_key: dappPublicKeyBase58,
      redirect_link: redirectUrl,
      cluster: 'devnet',
    });

    const url = `${this.PHANTOM_BASE_URL}connect?${params.toString()}`;
    
    console.log('=== PHANTOM CONNECT ===');
    console.log('Opening Phantom with URL:', url);
    console.log('Dapp Public Key:', dappPublicKeyBase58);
    console.log('Redirect URL:', redirectUrl);
    
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      const installUrl = this.getPhantomInstallUrl();
      await Linking.openURL(installUrl);
      throw new Error('Phantom wallet is not installed. Please install it from the app store.');
    }
    
    await Linking.openURL(url);
  }

  /**
   * Parse connection result from redirect URL
   * Phantom returns encrypted data that needs to be decrypted
   */
  static parseConnectionResult(url: string): DeepLinkConnectionResult | null {
    console.log('=== PARSING PHANTOM RESPONSE ===');
    console.log('Full URL:', url);
    
    try {
      const parsed = Linking.parse(url);
      console.log('Parsed URL:', JSON.stringify(parsed, null, 2));
      
      const { queryParams } = parsed;
      
      if (!queryParams) {
        console.log('No query params found');
        return null;
      }
      
      // Check for error response
      if (queryParams.errorCode) {
        console.log('Error from Phantom:', queryParams.errorCode, queryParams.errorMessage);
        return null;
      }
      
      // Get Phantom's encryption public key
      const phantomEncryptionPublicKey = queryParams.phantom_encryption_public_key as string;
      const nonce = queryParams.nonce as string;
      const data = queryParams.data as string;
      
      if (!phantomEncryptionPublicKey || !nonce || !data) {
        console.log('Missing required params. Got:', { phantomEncryptionPublicKey, nonce, data });
        return null;
      }
      
      console.log('Phantom encryption public key:', phantomEncryptionPublicKey);
      console.log('Nonce:', nonce);
      console.log('Data (encrypted):', data.slice(0, 50) + '...');
      
      // Create shared secret and decrypt
      const sharedSecret = this.createSharedSecret(phantomEncryptionPublicKey);
      const decryptedData = this.decryptPayload(data, nonce, sharedSecret);
      
      console.log('Decrypted data:', decryptedData);
      
      if (decryptedData.public_key && decryptedData.session) {
        return {
          publicKey: decryptedData.public_key,
          session: decryptedData.session,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing connection result:', error);
      return null;
    }
  }

  /**
   * Encrypt a payload to send to Phantom
   */
  private static encryptPayload(payload: any, sharedSecret: Uint8Array): { nonce: string; encryptedPayload: string } {
    const nonce = nacl.randomBytes(24);
    const payloadString = JSON.stringify(payload);
    const payloadBytes = Buffer.from(payloadString);
    
    const encryptedPayload = nacl.box.after(
      payloadBytes,
      nonce,
      sharedSecret
    );
    
    return {
      nonce: bs58.encode(nonce),
      encryptedPayload: bs58.encode(encryptedPayload),
    };
  }

  /**
   * Request Phantom to sign a transaction via Deep Link
   * NOTE: signAndSendTransaction was DEPRECATED by Phantom!
   * We now use signTransaction and broadcast manually.
   */
  static async signTransaction(
    transaction: Transaction,
    session: string,
    redirectUrl: string
  ): Promise<void> {
    console.log('=== SIGN TRANSACTION (Deep Link) ===');
    console.log('Session:', session ? session.slice(0, 20) + '...' : 'MISSING');
    console.log('Has shared secret:', !!this.sharedSecret);
    console.log('Redirect URL:', redirectUrl);
    
    if (!this.sharedSecret) {
      throw new Error('No shared secret. Please connect to Phantom first.');
    }
    
    if (!session) {
      throw new Error('No session token. Please reconnect to Phantom.');
    }
    
    const serializedTx = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });
    
    const base58Tx = bs58.encode(serializedTx);
    console.log('Transaction serialized, length:', base58Tx.length);
    
    const payload = {
      session,
      transaction: base58Tx,
    };
    
    const { nonce, encryptedPayload } = this.encryptPayload(payload, this.sharedSecret);
    const keypair = this.getDappKeyPair();

    const params = new URLSearchParams({
      dapp_encryption_public_key: bs58.encode(keypair.publicKey),
      nonce,
      redirect_link: redirectUrl,
      payload: encryptedPayload,
    });

    // Use signTransaction instead of deprecated signAndSendTransaction
    const url = `${this.PHANTOM_BASE_URL}signTransaction?${params.toString()}`;
    
    console.log('Opening Phantom for signing...');
    
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      throw new Error('Cannot open Phantom wallet. Please make sure it is installed.');
    }
    
    await Linking.openURL(url);
  }

  // Legacy method - kept for backwards compatibility but logs deprecation warning
  static async signAndSendTransaction(
    transaction: Transaction,
    session: string,
    redirectUrl: string
  ): Promise<void> {
    console.warn('⚠️ signAndSendTransaction is DEPRECATED by Phantom. Using signTransaction instead.');
    return this.signTransaction(transaction, session, redirectUrl);
  }

  /**
   * Parse transaction result from redirect URL
   * For signTransaction: Phantom returns the signed transaction bytes
   * For signAndSendTransaction (deprecated): Phantom returned the signature
   */
  static parseTransactionResult(url: string): { transaction: string } | { signature: string } | { error: string } | null {
    console.log('=== PARSING TRANSACTION RESPONSE ===');
    console.log('Full URL:', url);
    
    try {
      const parsed = Linking.parse(url);
      const { queryParams } = parsed;
      
      if (!queryParams) {
        console.log('No query params in transaction response');
        return null;
      }
      
      // Check for error response
      if (queryParams.errorCode) {
        const errorMessage = queryParams.errorMessage as string || 'Transaction was rejected';
        console.log('Transaction error from Phantom:', queryParams.errorCode, errorMessage);
        return { error: errorMessage };
      }
      
      // Get the encrypted response
      const nonce = queryParams.nonce as string;
      const data = queryParams.data as string;
      
      if (!nonce || !data) {
        console.log('Missing nonce or data in transaction response');
        return null;
      }
      
      if (!this.sharedSecret) {
        console.error('No shared secret available to decrypt transaction result');
        return { error: 'Session expired. Please reconnect.' };
      }
      
      // Decrypt the response
      const decryptedData = this.decryptPayload(data, nonce, this.sharedSecret);
      console.log('Decrypted transaction result keys:', Object.keys(decryptedData));
      
      // signTransaction returns { transaction: base58EncodedSignedTx }
      if (decryptedData.transaction) {
        console.log('Got signed transaction, length:', decryptedData.transaction.length);
        return { transaction: decryptedData.transaction };
      }
      
      // signAndSendTransaction (deprecated) returns { signature: ... }
      if (decryptedData.signature) {
        console.log('Got signature:', decryptedData.signature);
        return { signature: decryptedData.signature };
      }
      
      console.log('Unknown response format:', decryptedData);
      return null;
    } catch (error) {
      console.error('Error parsing transaction result:', error);
      return { error: 'Failed to parse transaction response' };
    }
  }

  /**
   * Check if we have an active session
   */
  static hasSession(): boolean {
    return this.sharedSecret !== null;
  }

  /**
   * Clear session (for disconnect)
   */
  static clearSession(): void {
    this.dappKeyPair = null;
    this.sharedSecret = null;
    this.phantomPublicKey = null;
    console.log('Phantom session cleared');
  }
}
