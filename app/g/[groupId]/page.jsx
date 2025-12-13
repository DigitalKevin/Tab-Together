 'use client';

import { useState, useEffect } from 'react';
import PeopleForm from '../../components/PeopleForm';
import ExpenseForm from '../../components/ExpenseForm';
import ExpenseList from '../../components/ExpenseList';
import Balances from '../../components/Balances';
import RecycleBin from '../../components/RecycleBin';
import '../../page.css';

export default function GroupPage({ params }) {
  const { groupId } = params;
  const [refreshSignal, setRefreshSignal] = useState(0);
  const [groupName, setGroupName] = useState('');
  const [copied, setCopied] = useState(false);

  const bump = () => setRefreshSignal((s) => s + 1);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const res = await fetch(`/api/groups?groupId=${groupId}`);
        if (res.ok) {
          const g = await res.json();
          setGroupName(g.name || 'Group');
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchGroup();
  }, [groupId]);

  const inviteLink = typeof window !== 'undefined' ? `${window.location.origin}/g/${groupId}` : `/g/${groupId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error(e);
      alert('Copy failed — please copy the link manually.');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: groupName || 'Fair Share group', url: inviteLink });
      } catch (e) {
        console.error(e);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <main className="container">
      <RecycleBin refreshSignal={refreshSignal} onRestore={bump} groupId={groupId} />

      <div className="card" style={{marginBottom:12}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <h3 style={{margin:0}}>{groupName}</h3>
            <div className="small">Invite link</div>
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <input readOnly value={inviteLink} style={{width:360}} onFocus={(e)=>e.target.select()} />
            <button className="btn-primary" onClick={handleCopy}>{copied ? 'Copied' : 'Copy'}</button>
            <button className="btn-primary" onClick={handleShare}>Share</button>
          </div>
        </div>
      </div>

      <div className="grid">
        <div className="left-panel">
          <PeopleForm onAdded={bump} refreshSignal={refreshSignal} groupId={groupId} />
          <ExpenseForm onAdded={bump} refreshSignal={refreshSignal} groupId={groupId} />
        </div>
        <div className="right-panel">
          <Balances refreshSignal={refreshSignal} groupId={groupId} />
          <div style={{marginTop:16}}>
            <ExpenseList refreshSignal={refreshSignal} onDelete={bump} groupId={groupId} />
          </div>
        </div>
      </div>
    </main>
  );
}
