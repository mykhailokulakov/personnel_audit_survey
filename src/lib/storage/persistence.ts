import type { RespondentSession } from '../types/respondent';

/** Contract for loading and saving a respondent session. */
export interface SurveyPersistence {
  saveSession(session: RespondentSession): Promise<void>;
  loadSession(code: string): Promise<RespondentSession | null>;
}

/** Thrown by RemotePersistence until a real backend is wired in. */
export class NotImplementedError extends Error {
  constructor() {
    super('Remote persistence is not implemented yet — backend stub');
    this.name = 'NotImplementedError';
  }
}

/** No-op implementation — data lives only in the Zustand store in memory. */
export class InMemoryPersistence implements SurveyPersistence {
  saveSession(_session: RespondentSession): Promise<void> {
    return Promise.resolve();
  }

  loadSession(_code: string): Promise<RespondentSession | null> {
    return Promise.resolve(null);
  }
}

/**
 * Stub for a future remote backend.
 * Replace the singleton export below with `new RemotePersistence(...)` when ready.
 */
export class RemotePersistence implements SurveyPersistence {
  saveSession(_session: RespondentSession): Promise<void> {
    return Promise.reject(new NotImplementedError());
  }

  loadSession(_code: string): Promise<RespondentSession | null> {
    return Promise.reject(new NotImplementedError());
  }
}

export const persistence: SurveyPersistence = new InMemoryPersistence();
