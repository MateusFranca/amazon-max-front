function b64DecodeUnicode(str: string): string {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) {
        str += '=';
    }
    return decodeURIComponent(
        Array.prototype.map.call(atob(str), function (c: string): string {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join('')
    );
}

function getTokenPayload() {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
        const payloadEncoded = token.split('.')[1];
        const payloadDecoded = b64DecodeUnicode(payloadEncoded);
        return JSON.parse(payloadDecoded);
    } catch (error) {
        console.error("Erro ao decodificar o token:", error);
        return null;
    }
}

function getIdFromToken() {
    const payload = getTokenPayload();
    return payload?.id || null;
}

function getAuthHeader() {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
}

function getCargoUsuario() {
    const token = localStorage.getItem('token');
    if (!token) return '';
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.aud || '';
}



export function generateCustomToken({
  nome,
  email,
  cargo,
  iat,
  exp,
  aud,
  iss
}: {
  nome: string;
  email: string;
  cargo: string;
  iat: number;
  exp: number;
  aud: string;
  iss: string;
}): string {
  const header = {
    alg: "HS256",
    typ: "JWT"
  };

  const payload = {
    nome,
    email,
    cargo,
    iat,
    exp,
    aud,
    iss
  };

  const base64Encode = (obj: object | string) =>
    btoa(typeof obj === 'string' ? obj : JSON.stringify(obj))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

  const headerEncoded = base64Encode(header);
  const payloadEncoded = base64Encode(payload);
  const signature = base64Encode(`${headerEncoded}.${payloadEncoded}`);

  return `${headerEncoded}.${payloadEncoded}.${signature}`;
}

export function getUserId(): string {
  try {
    const token = localStorage.getItem('token');
    if (!token) return '';
    
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) return '';
    
    const payload = JSON.parse(atob(tokenParts[1]));
    
    return payload.id || payload.sub || '';
  } catch (error) {
    console.error('Error extracting user ID from token:', error);
    return '';
  }
}

function isOfflineClientToken() {
    const token = localStorage.getItem("token");
    if (!token) return false;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.iss === 'offline-client';
    } catch {
        return false;
    }
}

export { getIdFromToken, getTokenPayload, getAuthHeader, getCargoUsuario, isOfflineClientToken };
