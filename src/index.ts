import express from 'express';
import { eq } from 'drizzle-orm';
import { db } from './db';
import { demoUsers } from './db/schema/index';

const app = express();
const PORT = 8000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, Welcome to classroom management app');
});

app.get('/demo-crud', async (req, res) => {
  try {
    const [newUser] = await db
      .insert(demoUsers)
      .values({ name: 'Admin User', email: 'admin@example.com' })
      .returning();

    if (!newUser) {
      throw new Error('Failed to create user');
    }

    const foundUser = await db.select().from(demoUsers).where(eq(demoUsers.id, newUser.id));

    const [updatedUser] = await db
      .update(demoUsers)
      .set({ name: 'Super Admin' })
      .where(eq(demoUsers.id, newUser.id))
      .returning();

    await db.delete(demoUsers).where(eq(demoUsers.id, newUser.id));

    res.json({
      created: newUser,
      read: foundUser[0],
      updated: updatedUser,
      deleted: true,
    });
  } catch (error) {
    console.error('Error performing CRUD operations:', error);
    res.status(500).json({ error: 'CRUD operation failed', details: String(error) });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
