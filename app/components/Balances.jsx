'use client';

import { useState, useEffect } from 'react';

export default function Balances({ refreshSignal }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/balances');
      if (res.ok) {
        setData(await res.json());
      }
    };
    fetchData();
  }, [refreshSignal]);

  if (!data) return <div className="list-section">Loading...</div>;

  return (
    <div className="list-section">
      <h3>Settlements</h3>
      {data.settlements.length === 0 ? (
        <p>All settled!</p>
      ) : (
        <ul className="settlements">
          {data.settlements.map((s, idx) => (
            <li key={idx}>
              <strong>{s.from.name}</strong> pays <strong>${s.amount.toFixed(2)}</strong> to <strong>{s.to.name}</strong>
            </li>
          ))}
        </ul>
      )}

      <h3>Balances</h3>
      <table>
        <thead>
          <tr>
            <th>Person</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          {Object.values(data.balances).map((b) => (
            <tr key={b.id}>
              <td>{b.name}</td>
              <td className={b.balance > 0 ? 'positive' : b.balance < 0 ? 'negative' : ''}>
                ${b.balance.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
