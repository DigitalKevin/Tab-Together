'use client';

import { useState, useEffect } from 'react';

export default function PeopleForm({ onAdded, refreshSignal, groupId }) {
  const [name, setName] = useState('');
  const [people, setPeople] = useState([]);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/people?groupId=${groupId || 'default'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        setName('');
        onAdded();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, personName) => {
    if (!confirm(`Delete ${personName}? All their expenses will also be removed. They can be restored from the recycle bin.`)) return;

    try {
      // First, fetch all expenses
      const expensesRes = await fetch(`/api/expenses?groupId=${groupId || 'default'}`);
      if (!expensesRes.ok) throw new Error('Failed to fetch expenses');
      const expenses = await expensesRes.json();
      
      // Find all expenses where this person is the payer
      const relatedExpenses = expenses.filter((e) => e.payer.id === id);
      
      // Step 1: Remove person from participant lists in all expenses
      for (const expense of expenses) {
        if (expense.participants && expense.participants.includes(id)) {
          const updatedParticipants = expense.participants.filter((pid) => pid !== id);
          await fetch(`/api/expenses?groupId=${groupId || 'default'}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: expense.id, participants: updatedParticipants }),
          });
        }
      }

      // Step 2: Delete all expenses where this person is the payer
      for (const expense of relatedExpenses) {
        await fetch(`/api/expenses?groupId=${groupId || 'default'}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: expense.id }),
        });
      }

      // Step 3: Delete the person
      const res = await fetch(`/api/people?groupId=${groupId || 'default'}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      
      if (res.ok) {
        // Store in recycle bin
        const deleted = people.find((p) => p.id === id);
        const saved = localStorage.getItem('deletedItems') || '{"people":[],"expenses":[]}';
        const { people: deletedPeople, expenses: deletedExpenses } = JSON.parse(saved);
        
        localStorage.setItem(
          'deletedItems',
          JSON.stringify({
            people: [...deletedPeople, deleted],
            expenses: [...deletedExpenses, ...relatedExpenses.map(e => ({
              ...e,
              payerId: e.payer.id,
            }))],
          })
        );
        onAdded();
      }
    } catch (error) {
      console.error(error);
      alert('Error deleting person');
    }
  };

  return (
    <div className="card">
      <h2>Add Person</h2>

      <form onSubmit={handleSubmit} className="form-group">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />
        <div style={{marginTop:10}}>
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Person'}
          </button>
        </div>
      </form>

      {people.length > 0 && (
        <div style={{marginTop:16}}>
          <h4 className="small">People ({people.length})</h4>
          <div style={{marginTop:8}}>
            {people.map((person) => (
              <div key={person.id} className="person-row">
                <div style={{display:'flex',gap:12,alignItems:'center'}}>
                  <div className="avatar">{(person.name || '').split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase()}</div>
                  <div>{person.name}</div>
                </div>
                <div>
                  <button
                    className="btn-delete"
                    style={{width:28,height:28,padding:0,display:'inline-flex',alignItems:'center',justifyContent:'center'}}
                    onClick={() => handleDelete(person.id, person.name)}
                    title="Delete person"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
