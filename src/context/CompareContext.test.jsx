import { describe, it, expect, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CompareProvider, useCompare, MAX_COMPARE } from './CompareContext';

const wrapper = ({ children }) => <CompareProvider>{children}</CompareProvider>;

describe('CompareContext', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('starts empty when localStorage has no saved comparison', () => {
    const { result } = renderHook(() => useCompare(), { wrapper });

    expect(result.current.compareIds).toEqual([]);
  });

  it('initializes from a previously saved comparison', () => {
    localStorage.setItem('compareVehicleIds', JSON.stringify(['a', 'b']));

    const { result } = renderHook(() => useCompare(), { wrapper });

    expect(result.current.compareIds).toEqual(['a', 'b']);
  });

  it('adds an id via toggleCompare when not already present', () => {
    const { result } = renderHook(() => useCompare(), { wrapper });

    act(() => result.current.toggleCompare('a'));

    expect(result.current.compareIds).toEqual(['a']);
    expect(result.current.isInCompare('a')).toBe(true);
  });

  it('removes an id via toggleCompare when already present', () => {
    const { result } = renderHook(() => useCompare(), { wrapper });

    act(() => result.current.toggleCompare('a'));
    act(() => result.current.toggleCompare('a'));

    expect(result.current.compareIds).toEqual([]);
    expect(result.current.isInCompare('a')).toBe(false);
  });

  it(`refuses to add a ${MAX_COMPARE + 1}th id once the cap of ${MAX_COMPARE} is reached`, () => {
    const { result } = renderHook(() => useCompare(), { wrapper });

    act(() => result.current.toggleCompare('a'));
    act(() => result.current.toggleCompare('b'));
    act(() => result.current.toggleCompare('c'));
    act(() => result.current.toggleCompare('d'));

    expect(result.current.compareIds).toEqual(['a', 'b', 'c']);
  });

  it('removeFromCompare removes a specific id regardless of position', () => {
    const { result } = renderHook(() => useCompare(), { wrapper });

    act(() => result.current.toggleCompare('a'));
    act(() => result.current.toggleCompare('b'));
    act(() => result.current.removeFromCompare('a'));

    expect(result.current.compareIds).toEqual(['b']);
  });

  it('clearCompare empties the list', () => {
    const { result } = renderHook(() => useCompare(), { wrapper });

    act(() => result.current.toggleCompare('a'));
    act(() => result.current.toggleCompare('b'));
    act(() => result.current.clearCompare());

    expect(result.current.compareIds).toEqual([]);
  });

  it('persists changes to localStorage', () => {
    const { result } = renderHook(() => useCompare(), { wrapper });

    act(() => result.current.toggleCompare('a'));

    expect(JSON.parse(localStorage.getItem('compareVehicleIds'))).toEqual(['a']);
  });
});
