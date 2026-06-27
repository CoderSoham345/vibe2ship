import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signInAnonymously,
  sendPasswordResetEmail,
  updateProfile,
  AuthError
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "./firebase";
import { UserProfile } from "./types";

/**
 * Standardize and map typical Firebase Authentication error codes to helpful, user-friendly
 * error descriptions, specifically highlighting the common console configuration requirements.
 */
export function mapAuthErrorToMessage(error: any): string {
  const err = error as AuthError;
  const code = err.code || "";
  
  switch (code) {
    case "auth/operation-not-allowed":
      return "Operation Not Allowed: The requested authentication provider (such as Email/Password or Google Sign-In) has not been enabled in the Firebase Console. To enable: Go to Firebase Console > Build > Authentication > Sign-in method, select the provider, enable it, and save.";
    case "auth/unauthorized-domain":
      return "Unauthorized Domain: This domain/URL is not authorized in your Firebase console. Go to Firebase Console > Authentication > Settings > Authorized domains, and click 'Add domain' to whitelist your current preview/Vercel/Cloud Run URL.";
    case "auth/popup-blocked":
      return "Popup Blocked: The authentication popup was blocked by your browser. Please disable your popup blocker for this application and retry.";
    case "auth/popup-closed-by-user":
      return "Popup Closed: The Google login popup was closed before completing the sign-in flow.";
    case "auth/email-already-in-use":
      return "Email Already in Use: An account with this email address already exists. Try signing in instead.";
    case "auth/invalid-email":
      return "Invalid Email: The email address format is invalid. Please enter a valid email.";
    case "auth/weak-password":
      return "Weak Password: The password must be at least 6 characters long.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid Credentials: The email/password combination is incorrect. Please verify your details.";
    case "auth/user-disabled":
      return "User Disabled: This account has been disabled by an administrator.";
    case "auth/network-request-failed":
      return "Network Error: Unable to reach the Firebase Authentication server. Please check your internet connection.";
    default:
      return err.message || "An unexpected authentication error occurred. Please try again.";
  }
}

/**
 * Register a new user with Email and Password, and initialize their profile in Firestore.
 */
export async function registerWithEmail(
  email: string, 
  password: string, 
  name: string, 
  college: string, 
  profession: string
): Promise<string> {
  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCred.user;
    
    // 1. Update Profile Display Name
    await updateProfile(user, { displayName: name });

    // 2. Initialize the user profile inside Firestore
    const userProfile: UserProfile = {
      uid: user.uid,
      name: name,
      email: email,
      college: college || "N/A",
      profession: profession,
      createdAt: new Date().toISOString(),
      productivityScore: 78 // Default starter momentum score
    };

    await setDoc(doc(db, "users", user.uid), userProfile);
    return user.uid;
  } catch (err: any) {
    console.error("Registration failed:", err);
    throw new Error(mapAuthErrorToMessage(err));
  }
}

/**
 * Log in an existing user with Email and Password, creating a profile fallback if missing.
 */
export async function loginWithEmail(email: string, password: string): Promise<string> {
  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const user = userCred.user;

    // Verify and synchronize the profile document in Firestore
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);
    
    if (!userDocSnap.exists()) {
      await setDoc(userDocRef, {
        uid: user.uid,
        name: user.displayName || "Momentum Strategist",
        email: user.email || email,
        college: "University",
        profession: "Student",
        createdAt: new Date().toISOString(),
        productivityScore: 75
      });
    }

    return user.uid;
  } catch (err: any) {
    console.error("Login failed:", err);
    throw new Error(mapAuthErrorToMessage(err));
  }
}

/**
 * Sign in or sign up a user using Google Authentication.
 */
export async function loginWithGoogle(): Promise<string> {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    const user = res.user;

    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      await setDoc(userDocRef, {
        uid: user.uid,
        name: user.displayName || "Google User",
        email: user.email || "",
        photoURL: user.photoURL || "",
        college: "N/A",
        profession: "Entrepreneur",
        createdAt: new Date().toISOString(),
        productivityScore: 80
      });
    }

    return user.uid;
  } catch (err: any) {
    console.error("Google authentication failed:", err);
    throw new Error(mapAuthErrorToMessage(err));
  }
}

/**
 * Quick access / Guest Authentication using Firebase Anonymous login.
 */
export async function loginAnonymously(): Promise<string> {
  try {
    const userCred = await signInAnonymously(auth);
    const user = userCred.user;
    
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);
    
    if (!userDocSnap.exists()) {
      await setDoc(userDocRef, {
        uid: user.uid,
        name: "Guest Planner",
        email: "guest@momentum.ai",
        college: "N/A",
        profession: "Freelancer",
        createdAt: new Date().toISOString(),
        productivityScore: 75
      });
    }

    return user.uid;
  } catch (err: any) {
    console.error("Anonymous authentication failed:", err);
    throw new Error(mapAuthErrorToMessage(err));
  }
}

/**
 * Request a password reset link to be sent via email.
 */
export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (err: any) {
    console.error("Password reset failed:", err);
    throw new Error(mapAuthErrorToMessage(err));
  }
}
