"use client";

import { LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signInWithGoogle, signOut } from "@/lib/auth";
import { useAuth } from "@/components/auth-provider";
import { toast } from "sonner";

export function AuthHeader() {
  const { user, loading } = useAuth();

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      toast.error('Failed to sign in. Please try again.');
      console.error('Sign in error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
      console.error('Sign out error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-9 w-20 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
      </div>
    );
  }

  if (!user) {
    return (
      <Button onClick={handleSignIn} variant="default">
        <LogIn className="mr-2 h-4 w-4" />
        Sign in with Google
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.picture} alt={user.name || 'User'} />
          <AvatarFallback>{user.name?.[0] || user.email?.[0] || 'U'}</AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {user.name || user.email}
        </span>
      </div>
      <Button onClick={handleSignOut} variant="outline" size="sm">
        <LogOut className="mr-2 h-4 w-4" />
        Sign out
      </Button>
    </div>
  );
}
