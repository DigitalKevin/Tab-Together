import { prisma } from '@/lib/prisma';

export async function GET(req) {
  try {
    const people = await prisma.person.findMany();
    const expenses = await prisma.expense.findMany();

    if (people.length === 0) {
      return Response.json({ people: [], balances: {}, settlements: [] });
    }

    // Parse expenses
    const parsedExpenses = expenses.map((e) => ({
      ...e,
      participants: JSON.parse(e.participantIds),
    }));

    // Compute balances
    const balances = {};
    people.forEach((p) => (balances[p.id] = 0));

    parsedExpenses.forEach((exp) => {
      const shareCount = exp.participants.length;
      const share = exp.amount / shareCount;
      balances[exp.payerId] += exp.amount;
      exp.participants.forEach((pid) => {
        balances[pid] -= share;
      });
    });

    // Round to cents
    Object.keys(balances).forEach((k) => {
      balances[k] = Math.round((balances[k] + Number.EPSILON) * 100) / 100;
    });

    // Create minimal settlements (greedy algorithm)
    const creditors = [];
    const debtors = [];

    for (const [idStr, bal] of Object.entries(balances)) {
      const id = parseInt(idStr);
      if (bal > 0.005) creditors.push({ id, amount: bal });
      else if (bal < -0.005) debtors.push({ id, amount: -bal });
    }

    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    const settlements = [];
    let i = 0,
      j = 0;
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const pay = Math.min(debtor.amount, creditor.amount);
      settlements.push({
        from: debtor.id,
        to: creditor.id,
        amount: Math.round((pay + Number.EPSILON) * 100) / 100,
      });
      debtor.amount -= pay;
      creditor.amount -= pay;
      if (debtor.amount <= 0.005) i++;
      if (creditor.amount <= 0.005) j++;
    }

    // Attach names
    const peopleMap = {};
    people.forEach((p) => (peopleMap[p.id] = p.name));

    const settlementsNamed = settlements.map((s) => ({
      from: { id: s.from, name: peopleMap[s.from] || String(s.from) },
      to: { id: s.to, name: peopleMap[s.to] || String(s.to) },
      amount: s.amount,
    }));

    const balancesNamed = {};
    for (const p of people) {
      balancesNamed[p.id] = { id: p.id, name: p.name, balance: balances[p.id] };
    }

    return Response.json({ people, expenses: parsedExpenses, balances: balancesNamed, settlements: settlementsNamed });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
