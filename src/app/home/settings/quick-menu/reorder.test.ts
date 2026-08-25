import assert from 'node:assert/strict';
import test from 'node:test';
import type { Product } from '@/lib/contracts';
import { computeReorder, sortByDisplayOrder } from './reorder';

const make = (id: string, category: string, quickSaleSortOrder?: number): Product => ({
  id,
  name: `สินค้า ${id}`,
  category,
  code: id,
  typeCode: id,
  active: true,
  quickSaleSortOrder,
  variants: [],
});

test('sortByDisplayOrder sinks unset orders to the bottom and tiebreaks by Thai name', () => {
  const sorted = sortByDisplayOrder([make('c', 'x'), make('b', 'x', 1), make('a', 'x', 0)]);
  assert.deepEqual(sorted.map(p => p.id), ['a', 'b', 'c']);
});

test('computeReorder moves a row globally and reindexes 0..n-1', () => {
  const all = sortByDisplayOrder([make('a', 'x', 0), make('b', 'x', 1), make('c', 'x', 2), make('d', 'x', 3)]);
  const { next, changes } = computeReorder(all, ['a', 'b', 'c', 'd'], 3, 1);

  assert.deepEqual(next.map(p => p.id), ['a', 'd', 'b', 'c']);
  assert.deepEqual(next.map(p => p.quickSaleSortOrder), [0, 1, 2, 3]);
  assert.deepEqual(changes, [
    { id: 'd', quickSaleSortOrder: 1 },
    { id: 'b', quickSaleSortOrder: 2 },
    { id: 'c', quickSaleSortOrder: 3 },
  ]);
});

test('computeReorder with a category subset keeps other categories in their global slots', () => {
  const all = sortByDisplayOrder([make('a', 'x', 0), make('m', 'y', 1), make('b', 'x', 2), make('n', 'y', 3), make('c', 'x', 4)]);
  const { next } = computeReorder(all, ['a', 'b', 'c'], 2, 0);

  assert.deepEqual(next.map(p => p.id), ['c', 'm', 'a', 'n', 'b']);
  assert.deepEqual(next.map(p => p.quickSaleSortOrder), [0, 1, 2, 3, 4]);
});

test('computeReorder normalizes legacy duplicate orders on the first move', () => {
  const all = [make('a', 'x', 0), make('b', 'x', 0), make('c', 'x', 0)];
  const { next, changes } = computeReorder(all, ['a', 'b', 'c'], 0, 1);

  assert.deepEqual(next.map(p => p.id), ['b', 'a', 'c']);
  assert.deepEqual(next.map(p => p.quickSaleSortOrder), [0, 1, 2]);
  // b keeps its previous value 0, so only a and c are reported as changed
  assert.deepEqual(changes, [
    { id: 'a', quickSaleSortOrder: 1 },
    { id: 'c', quickSaleSortOrder: 2 },
  ]);
});

test('computeReorder returns no changes for a no-op move or invalid indexes', () => {
  const all = [make('a', 'x', 0), make('b', 'x', 1)];
  assert.deepEqual(computeReorder(all, ['a', 'b'], 1, 1).changes, []);
  assert.deepEqual(computeReorder(all, ['a', 'b'], -1, 0).changes, []);
  assert.deepEqual(computeReorder(all, ['a', 'b'], 0, 5).changes, []);
});
