import { prisma } from '@/lib/prisma';

export async function GET(req) {
  try {
    const people = await prisma.person.findMany({
      orderBy: { id: 'asc' },
    });
    return Response.json(people);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { name } = await req.json();
    if (!name) {
      return Response.json({ error: 'Name required' }, { status: 400 });
    }
    const person = await prisma.person.create({
      data: { name },
    });
    return Response.json(person, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}
