import { describe, expect, it } from 'vite-plus/test';

import { createLeadDocketMockApi } from '../src/index';

describe('operation-specific mock routing through fetch', () => {
  it('adds and deletes contact tags without deleting the contact', async () => {
    const mock = createLeadDocketMockApi({
      seed: { contacts: [{ Id: 1, FirstName: 'Ada', LastName: 'Lovelace', Tags: [] }] },
    });

    const added = await mock.fetch('/api/contacts/1/tags/9', { method: 'PUT' });
    expect(added.ok).toBe(true);
    const contact = mock.getStore('contacts')[0];
    expect(contact.Tags).toEqual([expect.objectContaining({ TagId: 9 })]);
    const associationId = (contact.Tags as Array<{ Id: number }>)[0].Id;

    const deleted = await mock.fetch(`/api/contacts/1/tags/${associationId}`, {
      method: 'DELETE',
    });
    expect(deleted.ok).toBe(true);
    expect(mock.getStore('contacts')).toHaveLength(1);
    expect(mock.getStore('contacts')[0].Tags).toEqual([]);
  });

  it('deletes a lead note without deleting its parent lead', async () => {
    const mock = createLeadDocketMockApi({
      seed: {
        leads: [
          {
            Id: 1,
            FirstName: 'Grace',
            LastName: 'Hopper',
            Notes: [{ Id: 7, Text: 'Remove me' }],
          },
        ],
      },
    });

    const response = await mock.fetch('/api/leads/1/notes/7', { method: 'DELETE' });
    expect(response.ok).toBe(true);
    expect(mock.getStore('leads')).toHaveLength(1);
    expect(mock.getStore('leads')[0].Notes).toEqual([]);
  });

  it('uses query IDs for opportunity commands and never creates a phantom record', async () => {
    const mock = createLeadDocketMockApi({
      seed: { opportunities: [{ Id: 5, FirstName: 'Mock', LastName: 'Opportunity' }] },
    });

    const locked = await mock.fetch('/api/opportunities/lock?id=5', { method: 'PATCH' });
    expect(locked.ok).toBe(true);
    expect(mock.getStore('opportunities')).toHaveLength(1);
    expect(mock.getStore('opportunities')[0]).toMatchObject({ Id: 5, IsBeingEdited: true });

    const missing = await mock.fetch('/api/opportunities/lock?id=999', { method: 'PATCH' });
    expect(missing.status).toBe(404);
    expect(mock.getStore('opportunities')).toHaveLength(1);
  });
});
