'use client';

import { useState } from 'react';
import PeopleForm from './components/PeopleForm';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import Balances from './components/Balances';
import './page.css';

export default function Page() {
  const [refreshSignal, setRefreshSignal] = useState(0);

  const bump = () => setRefreshSignal((s) => s + 1);

  return (
    <main className="container">
      <header className="header">
        <h1>FairShare</h1>
        <p>Split expenses with friends</p>
      </header>

      <div className="grid">
        <div className="left-panel">
          <PeopleForm onAdded={bump} />
          <ExpenseForm onAdded={bump} />
        </div>
        <div className="right-panel">
          <Balances refreshSignal={refreshSignal} />
        </div>
      </div>

      <div className="expenses-section">
        <ExpenseList refreshSignal={refreshSignal} />
      </div>
    </main>
  );
}
