'use client';

import { useState, useEffect } from 'react';

export default function RecycleBin({ refreshSignal, onRestore, groupId }) {
  const [deletedPeople, setDeletedPeople] = useState([]);
  const [deletedExpenses, setDeletedExpenses] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('deletedItems');
    if (saved) {
      const { people, expenses } = JSON.parse(saved);
      setDeletedPeople(people || []);
      setDeletedExpenses(expenses || []);
    }
  }, [refreshSignal]);

  const restorePerson = async (person) => {
    try {
      const res = await fetch(`/api/people?groupId=${groupId || 'default'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: person.name }),
      });
      if (res.ok) {
        const newDeletedPeople = deletedPeople.filter((p) => p.id !== person.id);
        setDeletedPeople(newDeletedPeople);
        updateLocalStorage(newDeletedPeople, deletedExpenses);
        onRestore?.();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const restoreExpense = async (expense) => {
    try {
      const res = await fetch(`/api/expenses?groupId=${groupId || 'default'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: expense.description,
          amount: expense.amount,
          payerId: expense.payerId,
          participants: expense.participants,
        }),
      });
      if (res.ok) {
        const newDeletedExpenses = deletedExpenses.filter((e) => e.id !== expense.id);
        setDeletedExpenses(newDeletedExpenses);
        updateLocalStorage(deletedPeople, newDeletedExpenses);
        onRestore?.();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const permanentlyDelete = (type, id) => {
    if (type === 'person') {
      const newDeletedPeople = deletedPeople.filter((p) => p.id !== id);
      setDeletedPeople(newDeletedPeople);
      updateLocalStorage(newDeletedPeople, deletedExpenses);
    } else {
      const newDeletedExpenses = deletedExpenses.filter((e) => e.id !== id);
      setDeletedExpenses(newDeletedExpenses);
      updateLocalStorage(deletedPeople, newDeletedExpenses);
    }
  };

  const updateLocalStorage = (people, expenses) => {
    localStorage.setItem('deletedItems', JSON.stringify({ people, expenses }));
  };

  const hasItems = deletedPeople.length > 0 || deletedExpenses.length > 0;

  return (
    <>
      {/* Floating button */}
      <button
        className="recycle-bin-floating"
        onClick={() => setIsOpen(true)}
        title="Open recycle bin"
      >
        🗑️ {hasItems && <span className="badge">{deletedPeople.length + deletedExpenses.length}</span>}
      </button>

      {/* Modal overlay */}
      {isOpen && (
        <>
          <div className="modal-overlay" onClick={() => setIsOpen(false)} />
          <div className="recycle-bin-modal">
            <div className="modal-header">
              <h3>Recycle Bin</h3>
              <button
                className="modal-close"
                onClick={() => setIsOpen(false)}
                title="Close"
              >
                ✕
              </button>
            </div>

            <div className="modal-content">
              {!hasItems ? (
                <p className="empty-message">Recycle bin is empty</p>
              ) : (
                <>
                  {deletedPeople.length > 0 && (
                    <div className="recycle-section">
                      <h4>Deleted People</h4>
                      {deletedPeople.map((person) => (
                        <div key={`person-${person.id}`} className="recycle-item">
                          <span>{person.name}</span>
                          <div className="recycle-actions">
                            <button
                              className="restore-btn"
                              onClick={() => restorePerson(person)}
                              title="Restore"
                            >
                              ↩️ Restore
                            </button>
                            <button
                              className="delete-btn"
                              onClick={() => {
                                if (confirm('Permanently delete this person? This cannot be undone.')) {
                                  permanentlyDelete('person', person.id);
                                }
                              }}
                              title="Delete permanently"
                            >
                              ✕ Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {deletedExpenses.length > 0 && (
                    <div className="recycle-section">
                      <h4>Deleted Expenses</h4>
                      {deletedExpenses.map((expense) => (
                        <div key={`expense-${expense.id}`} className="recycle-item">
                          <div className="expense-info">
                            <span className="amount">${expense.amount.toFixed(2)}</span>
                            <span className="description">{expense.description || 'No description'}</span>
                          </div>
                          <div className="recycle-actions">
                            <button
                              className="restore-btn"
                              onClick={() => restoreExpense(expense)}
                              title="Restore"
                            >
                              ↩️ Restore
                            </button>
                            <button
                              className="delete-btn"
                              onClick={() => {
                                if (confirm('Permanently delete this expense? This cannot be undone.')) {
                                  permanentlyDelete('expense', expense.id);
                                }
                              }}
                              title="Delete permanently"
                            >
                              ✕ Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
