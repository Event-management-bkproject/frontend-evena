// Utility để phân tích JWT token
export const parseJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT:', error);
    return null;
  }
};

// Kiểm tra token có hết hạn không
export const isTokenExpired = (token: string): boolean => {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return true;

  const currentTime = Date.now() / 1000;
  return payload.exp < currentTime;
};

// Hiển thị thông tin token
export const getTokenInfo = (token: string) => {
  const payload = parseJwt(token);
  if (!payload) return null;

  return {
    subject: payload.sub,
    issuedAt: new Date(payload.iat * 1000).toLocaleString(),
    expiresAt: new Date(payload.exp * 1000).toLocaleString(),
    isExpired: isTokenExpired(token),
    roles: payload.roles || [],
    authorities: payload.authorities || [],
    // Các claims khác
    ...payload,
  };
};
