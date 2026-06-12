import { describe, expect, it } from 'vitest';
import { ok, err, isOk, isErr, mapResult, unwrap } from '@/src/utils/result';

describe('result utilities', () => {
  it('creates ok and err variants', () => {
    expect(ok(42)).toEqual({ ok: true, value: 42 });
    expect(err('failed')).toEqual({ ok: false, error: 'failed' });
  });

  it('narrows with type guards', () => {
    expect(isOk(ok('value'))).toBe(true);
    expect(isErr(err('nope'))).toBe(true);
  });

  it('maps successful values', () => {
    const mapped = mapResult(ok(2), (value) => value * 2);
    expect(mapped).toEqual({ ok: true, value: 4 });
  });

  it('unwraps successful values and throws on error', () => {
    expect(unwrap(ok('ready'))).toBe('ready');
    expect(() => unwrap(err('broken'))).toThrow('broken');
  });
});
