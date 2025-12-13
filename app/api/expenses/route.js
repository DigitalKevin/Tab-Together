import { prisma } from '@/lib/prisma';

export async function GET(req) {
  try {
    const expenses = await prisma.expense.findMany({
      include: { payer: true },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = expenses.map((exp) => ({
      ...exp,
      participants: JSON.parse(exp.participantIds),
      participantIds: undefined,
    }));

    return Response.json(formatted);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { description, amount, payerId, participants } = await req.json();

    if (typeof amount !== 'number' || !payerId || !Array.isArray(participants) || participants.length === 0) {
      return Response.json(
        { error: 'amount (number), payerId, participants (non-empty array) required' },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.create({
      data: {
        description: description || '',
        amount,
        payerId,
        participantIds: JSON.stringify(participants),
      },
      include: { payer: true },
    });

    return Response.json(
      {
        ...expense,
        participants: JSON.parse(expense.participantIds),
        participantIds: undefined,
      },
      { status: 201 }
    );
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}
