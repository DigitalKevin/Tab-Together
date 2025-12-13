'use client';

import { useState } from 'react';
import './page.css';

export default function Page() {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [joinId, setJoinId] = useState('');

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        const group = await res.json();
        window.location.href = `/g/${group.id}`;
      } else {
        const err = await res.json();
        alert(err?.error || 'Failed to create group');
      }
    } catch (e) {
      console.error(e);
      alert('Error creating group');
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = () => {
    const id = (joinId || '').trim();
    if (!id) return alert('Enter a group code or link');
    // If user pasted full URL, extract last segment
    try {
      const url = new URL(id);
      const parts = url.pathname.split('/').filter(Boolean);
      const last = parts[parts.length - 1];
      window.location.href = `/g/${last}`;
    } catch (e) {
      window.location.href = `/g/${id}`;
    }
  };

  return (
    <main className="container">
      <div className="landing-card card">
        <h1>Fair Share</h1>
        <p className="small">Create a shared group to track and split expenses. No signup — just share the link.</p>

        <div style={{marginTop:12}}>
          <input
            type="text"
            placeholder="Group name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div style={{marginTop:10}}>
            <button className="btn-primary" onClick={handleCreate} disabled={creating}>
              {creating ? 'Creating…' : 'Create Group'}
            </button>
          </div>
        </div>

        <hr style={{margin:'18px 0'}} />

        <div>
          <label className="small">Join existing group</label>
          <div style={{display:'flex',gap:8,marginTop:8}}>
            <input
              type="text"
              placeholder="Paste link or group code"
              value={joinId}
              onChange={(e) => setJoinId(e.target.value)}
            />
            <button className="btn-primary" onClick={handleJoin}>Join</button>
          </div>
        </div>

        <p className="small" style={{marginTop:14}}>Example invite: <em>yourapp.com/g/7fA92KdQ</em></p>
      </div>
    </main>
  );
}
