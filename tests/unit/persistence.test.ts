import { describe, it, expect } from 'vitest';
import {
  InMemoryPersistence,
  RemotePersistence,
  NotImplementedError,
  persistence,
} from '@/lib/storage/persistence';
import type { RespondentSession } from '@/lib/types/respondent';

const stubSession: RespondentSession = {
  code: 'test-001',
  startedAt: Date.now(),
  currentBlock: 'intro',
  answers: new Map(),
  blockStatus: new Map(),
  consents: { dataProcessing: false, selfCompletion: false },
};

describe('NotImplementedError', () => {
  it('is an instance of Error', () => {
    expect(new NotImplementedError()).toBeInstanceOf(Error);
  });

  it('has the correct message', () => {
    expect(new NotImplementedError().message).toMatch(/not implemented/i);
  });

  it('has name NotImplementedError', () => {
    expect(new NotImplementedError().name).toBe('NotImplementedError');
  });
});

describe('InMemoryPersistence', () => {
  it('saveSession resolves without error', async () => {
    const p = new InMemoryPersistence();
    await expect(p.saveSession(stubSession)).resolves.toBeUndefined();
  });

  it('loadSession always resolves to null', async () => {
    const p = new InMemoryPersistence();
    await expect(p.loadSession('any-code')).resolves.toBeNull();
  });
});

describe('RemotePersistence', () => {
  it('saveSession rejects with NotImplementedError', async () => {
    const p = new RemotePersistence();
    await expect(p.saveSession(stubSession)).rejects.toBeInstanceOf(NotImplementedError);
  });

  it('loadSession rejects with NotImplementedError', async () => {
    const p = new RemotePersistence();
    await expect(p.loadSession('any-code')).rejects.toBeInstanceOf(NotImplementedError);
  });
});

describe('persistence singleton', () => {
  it('is an InMemoryPersistence instance', () => {
    expect(persistence).toBeInstanceOf(InMemoryPersistence);
  });
});
