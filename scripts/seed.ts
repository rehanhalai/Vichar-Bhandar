import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { db } from '../src/db';
import { categories, thoughts, tags, reminders } from '../src/db/schema';
import crypto from 'crypto';

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // 1. Clear existing data (optional but good for reproducible seeds)
    console.log('🧹 Clearing existing data...');
    await db.delete(tags);
    await db.delete(reminders);
    await db.delete(thoughts);
    await db.delete(categories);

    // 2. Create Categories
    console.log('📁 Creating categories...');
    const catData = [
      { id: crypto.randomUUID(), name: 'Personal', color: '#3b82f6', createdAt: new Date() },
      { id: crypto.randomUUID(), name: 'Work', color: '#ef4444', createdAt: new Date() },
      { id: crypto.randomUUID(), name: 'Ideas', color: '#eab308', createdAt: new Date() },
      { id: crypto.randomUUID(), name: 'Health', color: '#22c55e', createdAt: new Date() },
      { id: crypto.randomUUID(), name: 'Finance', color: '#8b5cf6', createdAt: new Date() },
    ];
    await db.insert(categories).values(catData);

    // Helper to get random dates within the last 30 days
    const getRandomDate = (daysAgoStart = 30, daysAgoEnd = 0) => {
      const date = new Date();
      const randomDays = Math.floor(Math.random() * (daysAgoStart - daysAgoEnd + 1)) + daysAgoEnd;
      date.setDate(date.getDate() - randomDays);
      return date;
    };

    // 3. Create Thoughts & Tags
    console.log('📝 Creating thoughts and tags...');
    const numThoughts = 150;
    const thoughtsToInsert = [];
    const tagsToInsert = [];

    const commonTags = ['urgent', 'review', 'someday', 'reference', 'journal', 'meeting', 'project', 'random'];

    for (let i = 0; i < numThoughts; i++) {
      const id = crypto.randomUUID();
      const date = getRandomDate();
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
      const cat = catData[Math.floor(Math.random() * catData.length)];
      
      const moodScore = Math.random() > 0.3 ? Math.floor(Math.random() * 5) + 1 : null; // 70% have mood
      const isPinned = Math.random() > 0.9 ? 1 : 0; // 10% pinned

      thoughtsToInsert.push({
        id,
        body: `This is a generated thought #${i + 1}. Feeling productive and exploring new ideas. ${Math.random().toString(36).substring(7)}`,
        categoryId: Math.random() > 0.2 ? cat.id : null, // 80% have categories
        mood: moodScore,
        isPinned,
        date: dateStr,
        createdAt: date,
        updatedAt: date,
      });

      // Add 0-3 tags per thought
      const numTags = Math.floor(Math.random() * 4);
      const shuffledTags = [...commonTags].sort(() => 0.5 - Math.random());
      for (let j = 0; j < numTags; j++) {
        tagsToInsert.push({
          id: crypto.randomUUID(),
          thoughtId: id,
          label: shuffledTags[j],
        });
      }
    }

    // Insert thoughts in batches to avoid SQLite limits if any
    await db.insert(thoughts).values(thoughtsToInsert);
    if (tagsToInsert.length > 0) {
      await db.insert(tags).values(tagsToInsert);
    }

    // 4. Create Reminders
    console.log('⏰ Creating reminders...');
    const numReminders = 30;
    const remindersToInsert = [];

    for (let i = 0; i < numReminders; i++) {
      // 50% past/overdue, 50% future
      const isFuture = Math.random() > 0.5;
      const date = new Date();
      date.setDate(date.getDate() + (isFuture ? Math.floor(Math.random() * 14) : -Math.floor(Math.random() * 14)));
      const dateStr = date.toISOString().split('T')[0];

      // About 30% of reminders are "timeline" tasks with a start date 1-5 days before the due date
      let startDateStr = null;
      if (Math.random() > 0.7) {
        const startDate = new Date(date);
        startDate.setDate(startDate.getDate() - (Math.floor(Math.random() * 5) + 1));
        startDateStr = startDate.toISOString().split('T')[0];
      }

      const cat = catData[Math.floor(Math.random() * catData.length)];
      const isCompleted = !isFuture && Math.random() > 0.3 ? 1 : 0; // If past, 70% chance completed

      remindersToInsert.push({
        id: crypto.randomUUID(),
        title: `Reminder Task #${i + 1}`,
        description: Math.random() > 0.5 ? `Details for this reminder ${Math.random().toString(36).substring(7)}` : null,
        startDate: startDateStr,
        dueDate: dateStr,
        dueTime: Math.random() > 0.5 ? '14:00' : null,
        priority: Math.floor(Math.random() * 3) + 1, // 1 to 3
        isCompleted,
        categoryId: Math.random() > 0.2 ? cat.id : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await db.insert(reminders).values(remindersToInsert);

    console.log(`✅ Seed completed successfully!`);
    console.log(`  - ${catData.length} Categories`);
    console.log(`  - ${thoughtsToInsert.length} Thoughts`);
    console.log(`  - ${tagsToInsert.length} Tags`);
    console.log(`  - ${remindersToInsert.length} Reminders`);

  } catch (error) {
    console.error('❌ Error during seed:', error);
    process.exit(1);
  }
}

seed();
