import { Suspense } from 'react';
import { LoginForm } from './components/login-form';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Logo } from '@/components/logo';

function LoginPageContent() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Logo className="w-12 h-12" />
            <div className="text-2xl font-bold font-headline text-primary leading-tight">
              <div>Manipur Police</div>
              <div>Risk Fund</div>
            </div>
          </div>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
    return <LoginPageContent />;
}
