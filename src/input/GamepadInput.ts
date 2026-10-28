export function applyGamepadDeadzone(value: number, deadzone: number): number {
  const magnitude = Math.abs(value);
  if (magnitude <= deadzone) return 0;
  return Math.sign(value) * Math.min(1, (magnitude - deadzone) / (1 - deadzone));
}

export function gamepadAimAngle(x: number, y: number, deadzone: number): number | null {
  return Math.hypot(x, y) <= deadzone ? null : Math.atan2(y, x);
}
