// Custom messages (tiếng Việt)
export const validationMessages = {
  required: 'Trường này là bắt buộc',
  email: 'Email không hợp lệ',
  min: (field: string, min: number) => `${field} phải có ít nhất ${min} ký tự`,
  max: (field: string, max: number) => `${field} không được vượt quá ${max} ký tự`,
  password: {
    min: 'Mật khẩu phải có ít nhất 6 ký tự',
    max: 'Mật khẩu không được vượt quá 100 ký tự',
    strength: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt (@#$%^&+=)',
    match: 'Mật khẩu không khớp',
  },
  phone: {
    invalid: 'Số điện thoại không hợp lệ',
    format: 'Số điện thoại phải có 10-15 chữ số và có thể bắt đầu bằng +',
  },
};
