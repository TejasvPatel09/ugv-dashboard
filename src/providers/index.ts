import { DataProvider } from './DataProvider';
import { MockProvider } from './mock/MockProvider';
import { ApiProvider } from './api/ApiProvider';

export function createProvider(): DataProvider {
  // @ts-ignore
  const source = import.meta.env?.VITE_DATA_SOURCE || 'mock';
  if (source === 'api') {
    return new ApiProvider();
  }
  return new MockProvider();
}
