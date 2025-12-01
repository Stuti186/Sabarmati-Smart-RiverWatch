
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

require('dotenv').config();

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

async function testLogin() {
  console.log('Initializing Firebase...');
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  const email = 'test@example.com';
  const password = 'test123456';

  console.log(`Attempting login with ${email}...`);

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Login SUCCESS!');
    console.log('User UID:', userCredential.user.uid);
  } catch (error) {
    console.error('Login FAILED:', error.code, error.message);
    
    if (error.code === 'auth/operation-not-allowed') {
      console.log('Attempting registration to confirm provider status...');
      try {
        const { createUserWithEmailAndPassword } = require('firebase/auth');
        const newEmail = `test_${Date.now()}@example.com`;
        await createUserWithEmailAndPassword(auth, newEmail, password);
        console.log('Registration SUCCESS! (Provider IS enabled, but maybe Sign-in has issues?)');
      } catch (regError) {
        console.error('Registration FAILED:', regError.code, regError.message);
      }
    }
  }
}

testLogin();
