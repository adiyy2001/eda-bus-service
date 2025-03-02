import { FakeLocalStorage } from '../../helpers/fake-local-storage'; // Adjust path as needed

describe('FakeLocalStorage', () => {
  let storage: FakeLocalStorage;

  beforeEach(() => {
    storage = new FakeLocalStorage();
  });

  it('should return null for non-existent keys', () => {
    expect(storage.getItem('nonExistingKey')).toBeNull();
  });

  it('should store and retrieve items correctly', () => {
    storage.setItem('key1', 'value1');
    expect(storage.getItem('key1')).toBe('value1');
  });

  it('should overwrite an existing key', () => {
    storage.setItem('key1', 'value1');
    storage.setItem('key1', 'value2');
    expect(storage.getItem('key1')).toBe('value2');
  });

  it('should remove an item correctly', () => {
    storage.setItem('key1', 'value1');
    expect(storage.getItem('key1')).toBe('value1');
    storage.removeItem('key1');
    expect(storage.getItem('key1')).toBeNull();
  });

  it('should clear all items', () => {
    storage.setItem('key1', 'value1');
    storage.setItem('key2', 'value2');
    expect(storage.getItem('key1')).toBe('value1');
    expect(storage.getItem('key2')).toBe('value2');

    storage.clear();

    expect(storage.getItem('key1')).toBeNull();
    expect(storage.getItem('key2')).toBeNull();
  });
});
