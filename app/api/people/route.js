import { prisma } from '@/lib/prisma';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get('groupId') || 'default';

    const people = await prisma.person.findMany({
      where: { groupId },
      orderBy: { id: 'asc' },
    });
    return Response.json(people);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get('groupId') || 'default';

    const { name } = await req.json();
    if (!name) {
      return Response.json({ error: 'Name required' }, { status: 400 });
    }
    const person = await prisma.person.create({
      data: { name, groupId },
    });
    return Response.json(person, { status: 201 });
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
    await prisma.person.delete({
      where: { id: parseInt(id) },
    });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}
