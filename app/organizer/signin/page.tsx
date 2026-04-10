import { redirect } from 'next/navigation';

export default function OrganizerSignInRedirect() {
  return redirect('/signin/password_signin');
}
