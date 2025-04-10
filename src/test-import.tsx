import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function TestComponent() {
  return (
    <Avatar>
      <AvatarImage src="" alt="Test" />
      <AvatarFallback>TS</AvatarFallback>
    </Avatar>
  );
} 