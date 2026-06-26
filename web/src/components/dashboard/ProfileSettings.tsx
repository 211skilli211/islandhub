'use client';

import { useState } from 'react';

export default function ProfileSettings() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-ink-primary">Profile Settings</h3>
      <div className="bg-surface-elevated rounded-2xl border border-white/10 p-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-ink-tertiary mb-1">Display Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-white/10 bg-surface-secondary text-sm text-white"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-tertiary mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-white/10 bg-surface-secondary text-sm text-white"
            placeholder="your@email.com"
          />
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-accent-500 text-white rounded-lg text-sm font-medium hover:bg-accent-600"
        >
          {saved ? '✓ Saved' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
