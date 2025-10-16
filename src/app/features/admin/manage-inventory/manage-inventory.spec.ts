import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageInventory } from './manage-inventory';

describe('ManageInventory', () => {
  let component: ManageInventory;
  let fixture: ComponentFixture<ManageInventory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageInventory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageInventory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
