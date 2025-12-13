import { prisma } from '@/lib/prisma';

export async function POST(req) {
  try {
    const { name } = await req.json();
    const id = require('crypto').randomBytes(6).toString('base64url');
    const group = await prisma.group.create({
      data: { id, name: name || 'Group' },
    });
    return Response.json(group, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get('groupId');
    if (!groupId) return Response.json({ error: 'groupId required' }, { status: 400 });

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { people: true, expenses: true },
    });

    if (!group) return Response.json({ error: 'Group not found' }, { status: 404 });

    const formattedExpenses = group.expenses.map((e) => ({
      ...e,
      participants: JSON.parse(e.participantIds),
      participantIds: undefined,
    }));

    return Response.json({ ...group, expenses: formattedExpenses });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
