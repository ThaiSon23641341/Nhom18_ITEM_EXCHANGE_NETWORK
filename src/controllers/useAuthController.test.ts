import { isValidStudentEmail } from './useAuthController';

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
