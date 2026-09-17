"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ChatInput({ onSend, disabled }: { onSend: (c: string) => void, disabled: boolean }) {
  const [value, setValue] = useState('');
  return (
    <div className='flex gap-2'>
      <Input
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && value.trim() && !disabled) {
            onSend(value.trim());
            setValue('');
          }
        }}
        placeholder="พิมพ์คำถาม..."
        disabled={disabled}
      />
      <Button onClick={() => { onSend(value.trim()); setValue(''); }} disabled={disabled || !value.trim()}>ส่ง</Button>      
    </div>
  );
}
