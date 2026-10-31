/**
 * src/utils/apiErrorMessage.ts
 *
 * Chuyển đổi mã lỗi từ API/Service thành thông điệp tiếng Việt thân thiện với người dùng.
 * Kiểm tra kiểu an toàn đối với thuộc tính `code` mà không phụ thuộc trực tiếp vào class lỗi cụ thể.
 */

export function getApiErrorMessage(error: unknown, fallbackMessage = 'Đã có lỗi xảy ra. Vui lòng thử lại sau.'): string {
  if (!error) {
    return fallbackMessage;
  }

  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, unknown>;
    const code = typeof errorObj.code === 'string' ? errorObj.code : undefined;

    switch (code) {
      case 'NOT_FOUND':
        return 'Món đồ không còn tồn tại hoặc đã bị xóa.';
      case 'PROHIBITED_CONTENT':
        return 'Nội dung chứa từ ngữ hoặc thông tin không được phép.';
      case 'BAD_REQUEST':
        return typeof errorObj.message === 'string' && errorObj.message.trim()
          ? errorObj.message
          : 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
      case 'UNAUTHORIZED':
        return 'Bạn cần đăng nhập để thực hiện thao tác này.';
      case 'FORBIDDEN':
        return 'Bạn không có quyền thực hiện thao tác này.';
      default:
        if (typeof errorObj.message === 'string' && errorObj.message.trim()) {
          return errorObj.message;
        }
    }
  }

  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  return fallbackMessage;
}
