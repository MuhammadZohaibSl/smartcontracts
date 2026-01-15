// Polyfills required for Solana web3.js in React Native
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import { Buffer } from 'buffer';

global.Buffer = Buffer;
