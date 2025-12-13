'use client';

import { useState, useEffect } from 'react';

export default function Balances({ refreshSignal, groupId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/balances?groupId=${groupId || 'default'}`);
      if (res.ok) {
        setData(await res.json());
      }
    };
    fetchData();
  }, [refreshSignal]);

  if (!data) return <div className="card">Loading...</div>;

  return (
    <div className="card">
      <h2>Balances</h2>

      <div style={{marginBottom:12}}>
        {Object.values(data.balances).map((b) => (
          <div key={b.id} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #eef2f6'}}>
            <div style={{fontWeight:600}}>{b.name}</div>
            <div className={b.balance > 0 ? 'balance-positive' : b.balance < 0 ? 'balance-negative' : 'balance-zero'}>
              ${b.balance.toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      <h2 style={{marginTop:14}}>Settlements</h2>
      {data.settlements.length === 0 ? (
        <p className="small">All settled!</p>
      ) : (
        <div>
          {data.settlements.map((s, idx) => (
            <div key={idx} className="small card" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <strong>{s.from.name}</strong> pays <strong>${s.amount.toFixed(2)}</strong> to <strong>{s.to.name}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
