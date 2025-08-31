import { fetchAuthSession } from 'aws-amplify/auth';

// returns the current Cognito ID token (JWT) or null if not signed in
export async function getIdToken(): Promise<string | null> {
  try {
    const { tokens } = await fetchAuthSession();
    return tokens?.idToken?.toString() ?? null;
  } catch {
    return null;
  }
}

//access token
export async function getAccessToken(): Promise<string | null> {
  try {
    const { tokens } = await fetchAuthSession();
    return tokens?.accessToken?.toString() ?? null;
  } catch {
    return null;
  }
}
