import { prisma } from '@/lib/prisma';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get('groupId') || 'default';

    const expenses = await prisma.expense.findMany({
      where: { groupId },
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
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get('groupId') || 'default';

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
        groupId,
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

export async function PATCH(req) {
  try {
    const { id, description, amount, payerId, participants } = await req.json();
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get('groupId') || 'default';
    
    if (!id) {
      return Response.json({ error: 'ID required' }, { status: 400 });
    }

    if (participants !== undefined && Array.isArray(participants) && participants.length === 0) {
      await prisma.expense.delete({
        where: { id: parseInt(id) },
      });
      return Response.json({ ok: true, deleted: true });
    }

    const updateData = {};
    if (description !== undefined) updateData.description = description;
    if (amount !== undefined) updateData.amount = amount;
    if (payerId !== undefined) updateData.payerId = payerId;
    if (participants !== undefined && Array.isArray(participants)) {
      updateData.participantIds = JSON.stringify(participants);
    }

    const expense = await prisma.expense.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: { payer: true },
    });

    return Response.json({
      ...expense,
      participants: JSON.parse(expense.participantIds),
      participantIds: undefined,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req) {
  try {
    const { id } = await req.json();
    if (!id) {
      return Response.json({ error: 'ID required' }, { status: 400 });
    }
    await prisma.expense.delete({
      where: { id: parseInt(id) },
    });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}
