import { randomBytes, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { Contact } from '../contact';
import { addressBook } from './address-book';
import { db } from './db';
import { contacts } from './schema';

export async function createDemo() {
  const id = `demo-${randomBytes(24).toString('hex')}`;
  const book = addressBook(db);
  await book.ensureProfile(id, 'Augie');
  const people = [
    ['Alex', 'Morgan', 'Brooklyn', 'NY', 'she / her', '1', '3'],
    ['Jamie', 'Chen', 'San Francisco', 'CA', 'they / them', '2', '12'],
    ['Jordan', 'Davis', 'Austin', 'TX', 'he / him', '3', '28'],
    ['Leah', 'Thompson', 'Chicago', 'IL', 'she / her', '4', '65'],
    ['Marcus', 'Williams', 'Portland', 'OR', 'he / him', '5', '101'],
    ['Nina', 'Patel', 'Seattle', 'WA', 'she / her', '6', '132'],
    ['Sam', 'Rivera', 'Los Angeles', 'CA', 'they / them', '7', '192'],
    ['Sophie', 'Martin', 'Denver', 'CO', 'she / her', '8', '250']
  ];
  for (const [index, person] of people.entries()) {
    const [
      firstName = '',
      lastName = '',
      city = '',
      region = '',
      pronouns = '',
      photo = '',
      offset = '0'
    ] = person;
    const birthday = new Date();
    birthday.setDate(birthday.getDate() + Number(offset));
    birthday.setFullYear(1994 + (index % 4));
    const data = {
      ...Contact.empty(),
      firstName,
      lastName,
      city,
      region,
      pronouns,
      country: 'United States',
      street: `${120 + index * 13} Maple Street`,
      postalCode: '10001',
      email: `${firstName.toLowerCase()}@example.com`,
      phone: `+1 (202) 555-01${String(index).padStart(2, '0')}`,
      birthday: birthday.toISOString().slice(0, 10),
      notes:
        index === 0
          ? 'Always up for a coffee and a long walk. Text is the best way to reach me!'
          : '',
      photo: `data:image/jpeg;base64,${readFileSync(`static/demo/${photo}.jpg`).toString('base64')}`
    };
    await db.insert(contacts).values({
      id: randomUUID(),
      ownerId: id,
      createdAt: Date.now() - index * 86_400_000,
      data,
      favorite: index < 2
    });
  }
  await book.createInvitations(id, 1, 'Priya');
  await book.createInvitations(id, 1, 'Taylor');
  await book.createInvitations(id, 1, '');
  return id;
}
