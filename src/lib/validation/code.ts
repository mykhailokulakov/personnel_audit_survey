const CODE_REGEX = /^[a-zA-Z0-9_-]+$/;
const MIN_LENGTH = 4;
const MAX_LENGTH = 32;

type ValidationSuccess = { valid: true };
type ValidationFailure = { valid: false; error: string };

/** Result of validating a respondent code. */
export type ValidationResult = ValidationSuccess | ValidationFailure;

/**
 * Validates a respondent code against the allowed format.
 * Rules: 4–32 characters, only letters (a–z, A–Z), digits (0–9), underscores and hyphens.
 *
 * @param value - The raw string entered by the respondent.
 * @returns `{ valid: true }` or `{ valid: false, error: string }`.
 */
export function validateCode(value: string): ValidationResult {
  if (value.length === 0) {
    return { valid: false, error: 'Код не може бути порожнім.' };
  }
  if (value.length < MIN_LENGTH) {
    return { valid: false, error: `Код має містити щонайменше ${MIN_LENGTH} символи.` };
  }
  if (value.length > MAX_LENGTH) {
    return { valid: false, error: `Код не може перевищувати ${MAX_LENGTH} символів.` };
  }
  if (!CODE_REGEX.test(value)) {
    return {
      valid: false,
      error: 'Код може містити лише латинські літери, цифри, символи _ та -.',
    };
  }
  return { valid: true };
}
