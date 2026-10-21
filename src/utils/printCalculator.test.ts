import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateSKTotal,
  calculatePrintCost,
  generateUpiUrl,
  parsePageRange,
  SHOP_CONFIG,
} from './printCalculator.ts';

test('calculateSKTotal calculates ₹5 small document accurately', () => {
  // 5 per page * 2 pages * 3 copies = ₹30
  const total = calculateSKTotal({
    pricePerPage: 5,
    pages: 2,
    copies: 3,
  });
  assert.equal(total, 30);
});

test('calculateSKTotal calculates ₹10 large Aadhaar document accurately', () => {
  // 10 per page * 1 page * 4 copies = ₹40
  const total = calculateSKTotal({
    pricePerPage: 10,
    pages: 1,
    copies: 4,
  });
  assert.equal(total, 40);
});

test('calculateSKTotal calculates ₹30 photo paper print accurately', () => {
  // 30 per page * 2 pages * 1 copy = ₹60
  const total = calculateSKTotal({
    pricePerPage: 30,
    pages: 2,
    copies: 1,
  });
  assert.equal(total, 60);
});

test('generateUpiUrl generates valid PhonePe UPI string for SK ANISUR RAHAMAN', () => {
  const upiUrl = generateUpiUrl({
    amount: 15,
  });
  assert.ok(upiUrl.startsWith('upi://pay?'));
  assert.ok(upiUrl.includes(`pa=${SHOP_CONFIG.upiId}`));
  assert.ok(upiUrl.includes('am=15'));
  assert.ok(upiUrl.includes('cu=INR'));
});

test('parsePageRange correctly handles page extraction', () => {
  const result = parsePageRange('1-2, 5', 6);
  assert.deepEqual(result, [1, 2, 5]);
});
