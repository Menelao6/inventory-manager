import { TestBed } from '@angular/core/testing';

import { GenerateOrderId } from './generate-order-id';

describe('GenerateOrderId', () => {
  let service: GenerateOrderId;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GenerateOrderId);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
