export function randomString(length: number, chars: string): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function isValidTarget(target: string, chars: string): boolean {
  for (let i = 0; i < target.length; i++) {
    if (!chars.includes(target.charAt(i))) {
      return false;
    }
  }
  return true;
}