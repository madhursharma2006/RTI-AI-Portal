'use client';
import { useEffect, useState } from 'react';

const WORDS = ['Right to Know', 'Right to Ask', 'Right to Answers', 'Right to Transparency'];

export default function RotatingWord() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % WORDS.length), 2600);
    return () => clearInterval(t);
  }, []);
  return <span key={i} className="gradient-text inline-block animate-fade-up">{WORDS[i]}</span>;
}
