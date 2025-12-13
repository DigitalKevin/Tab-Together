'use client';

import { useState, useEffect } from 'react';

export default function ExpenseForm({ onAdded, refreshSignal, groupId }) {
  const [people, setPeople] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [payerId, setPayerId] = useState('');
  const [participants, setParticipants] = useState(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPeople = async () => {
      const res = await fetch(`/api/people?groupId=${groupId || 'default'}`);
      if (res.ok) {
        setPeople(await res.json());
      }
    };
    fetchPeople();
  }, [refreshSignal]);

  const handleToggleParticipant = (id) => {
    const newSet = new Set(participants);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setParticipants(newSet);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !payerId || participants.size === 0) {
      alert('Please fill all fields and select participants');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/expenses?groupId=${groupId || 'default'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          amount: parseFloat(amount),
          payerId: parseInt(payerId),
          participants: Array.from(participants).map(Number),
        }),
      });
      if (res.ok) {
        setDescription('');
        setAmount('');
        setPayerId('');
        setParticipants(new Set());
        onAdded();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Add Expense</h2>

      <form onSubmit={handleSubmit} className="form-group">
        <div className="form-group">
          <input
            type="text"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <input
            type="number"
            placeholder="Amount"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <select value={payerId} onChange={(e) => setPayerId(e.target.value)} disabled={loading}>
            <option value="">Who paid?</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="small">Who's involved?</label>
          <div className="checkbox-grid" style={{marginTop:8}}>
            {people.map((p) => (
              <label key={p.id}>
                <input
                  type="checkbox"
                  checked={participants.has(p.id)}
                  onChange={() => handleToggleParticipant(p.id)}
                  disabled={loading}
                />
                {p.name}
              </label>
            ))}
          </div>
        </div>

        <div>
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Expense'}
          </button>
        </div>
      </form>
    </div>
  );
}
