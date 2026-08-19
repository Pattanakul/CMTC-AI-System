"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ChatInput({ onSend, disabled }: { onSend: (c: string) => void, disabled: boolean }) {
  const [value, setValue] = useState('');
  return (
    <div className='flex gap-2'>
      <Input value={value} onChange={e => setValue(e.target.value)} disabled={disabled} />
      <Button onClick={() => { onSend(value); setValue(''); }} disabled={disabled || !value}>Send</Button>      
    </div>
  );
}
