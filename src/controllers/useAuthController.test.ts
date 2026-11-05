import { isValidPassword, isValidStudentEmail } from './useAuthController';

describe('isValidPassword', () => {
  test('accepts 8-64 characters with upper, lower, digit and symbol', () => {
    expect(isValidPassword('Abcd@1234')).toBe(true);
  });

  test.each([
    'abcd@1234',
    'ABCD@1234',
    'Abcd@abcd',
    'Abcd12345',
    'Ab@1',
    'Abcd @1234',
    `Ab@1${'a'.repeat(61)}`,
  ])('rejects weak password: %s', (password) => {
    expect(isValidPassword(password)).toBe(false);
  });
});

describe('isValidStudentEmail', () => {
  test('accepts eight digits, a name, and the student IUH domain', () => {
    expect(isValidStudentEmail('21036001.nguyen@student.iuh.edu.vn')).toBe(true);
  });

  test('accepts multiple name segments separated by dots or hyphens', () => {
    expect(isValidStudentEmail('21036001.nguyen-van.a@student.iuh.edu.vn')).toBe(
      true,
    );
  });

  test('ignores surrounding whitespace and domain casing', () => {
    expect(isValidStudentEmail('  21036001.nguyen@STUDENT.IUH.EDU.VN  ')).toBe(
      true,
    );
  });

  test.each([
    '2103600.nguyen@student.iuh.edu.vn',
    '210360011.nguyen@student.iuh.edu.vn',
    '2103600a.nguyen@student.iuh.edu.vn',
    '21036001@student.iuh.edu.vn',
    '21036001.nguyen@iuh.edu.vn',
    '21036001.nguyen@example.com',
  ])('rejects invalid student email: %s', (email) => {
    expect(isValidStudentEmail(email)).toBe(false);
  });
});
