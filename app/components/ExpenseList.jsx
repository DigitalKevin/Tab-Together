'use client';

import { useState, useEffect } from 'react';

export default function ExpenseList({ refreshSignal, onDelete, groupId }) {
  const [expenses, setExpenses] = useState([]);
  const [people, setPeople] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/expenses?groupId=${groupId || 'default'}`);
      if (res.ok) {
        const data = await res.json();
        setExpenses(Array.isArray(data) ? data : []);
      }
    };
    fetchData();
  }, [refreshSignal]);

  useEffect(() => {
    const fetchPeople = async () => {
      const res = await fetch(`/api/people?groupId=${groupId || 'default'}`);
      if (res.ok) {
        setPeople(await res.json());
      }
    };
    fetchPeople();
  }, [refreshSignal]);

  const handleEdit = (expense) => {
    setEditingId(expense.id);
    setEditForm({
      description: expense.description || '',
      amount: expense.amount,
      payerId: expense.payer.id,
      participants: [...expense.participants],
    });
  };

  const handleSaveEdit = async () => {
    try {
      const res = await fetch(`/api/expenses?groupId=${groupId || 'default'}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId,
          description: editForm.description,
          amount: parseFloat(editForm.amount),
          payerId: parseInt(editForm.payerId),
          participants: editForm.participants.map(Number),
        }),
      });
      if (res.ok) {
        setEditingId(null);
        setEditForm({});
        onDelete?.();
      }
    } catch (error) {
      console.error(error);
      alert('Error saving expense');
    }
  };

  const handleToggleParticipant = (id) => {
    setEditForm((prev) => {
      const newParticipants = prev.participants.includes(id)
        ? prev.participants.filter((p) => p !== id)
        : [...prev.participants, id];
      return { ...prev, participants: newParticipants };
    });
  };

  const handleDelete = async (expense) => {
    if (!confirm(`Delete this expense? It will go to the recycle bin.`)) return;

    try {
      const res = await fetch(`/api/expenses?groupId=${groupId || 'default'}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: expense.id }),
      });
      if (res.ok) {
        // Store in recycle bin
        const saved = localStorage.getItem('deletedItems') || '{"people":[],"expenses":[]}';
        const { people: deletedPeople, expenses: deletedExpenses } = JSON.parse(saved);
        localStorage.setItem(
          'deletedItems',
          JSON.stringify({
            people: deletedPeople,
            expenses: [
              ...deletedExpenses,
              {
                ...expense,
                payerId: expense.payer.id,
              },
            ],
          })
        );
        setExpenses(expenses.filter((e) => e.id !== expense.id));
        onDelete?.();
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (editingId) {
    return (
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2>Edit Expense</h2>
          <button
            className="btn-delete"
            onClick={() => setEditingId(null)}
            style={{ width: 28, height: 28, padding: 0 }}
          >
            ✕
          </button>
        </div>

        <div className="form-group">
          <label className="small">Description</label>
          <input
            type="text"
            placeholder="Description (optional)"
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="small">Amount</label>
          <input
            type="number"
            step="0.01"
            value={editForm.amount}
            onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="small">Who paid?</label>
          <select
            value={editForm.payerId || ''}
            onChange={(e) => setEditForm({ ...editForm, payerId: e.target.value })}
          >
            <option value="">Select payer</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="small">Who's involved?</label>
          <div className="checkbox-grid" style={{ marginTop: 8 }}>
            {people.map((p) => (
              <label key={p.id}>
                <input
                  type="checkbox"
                  checked={editForm.participants.includes(p.id)}
                  onChange={() => handleToggleParticipant(p.id)}
                />
                {p.name}
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <button className="btn-primary" onClick={handleSaveEdit}>
            Save
          </button>
          <button
            className="btn-delete"
            onClick={() => setEditingId(null)}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Expenses</h2>
      {expenses.length === 0 ? (
        <p className="small">No expenses yet</p>
      ) : (
        <div className="expenses-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
                <th>Paid by</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => (
                <tr key={exp.id}>
                  <td style={{fontWeight:600}}>{exp.description || '-'}</td>
                  <td>${exp.amount.toFixed(2)}</td>
                  <td>{exp.payer.name}</td>
                  <td>{new Date(exp.createdAt).toLocaleDateString()}</td>
                  <td style={{textAlign:'center', display: 'flex', gap: 4, justifyContent: 'center' }}>
                    <button
                      className="btn-delete"
                      onClick={() => handleEdit(exp)}
                      title="Edit expense"
                      style={{width:28,height:28,padding:0}}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(exp)}
                      title="Delete expense"
                      style={{width:28,height:28,padding:0}}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
