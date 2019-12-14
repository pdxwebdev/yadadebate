import { TestBed } from '@angular/core/testing';

import { BulletinSecretService } from './bulletin-secret.service';

describe('BulletinSecretService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BulletinSecretService = TestBed.get(BulletinSecretService);
    expect(service).toBeTruthy();
  });
});
