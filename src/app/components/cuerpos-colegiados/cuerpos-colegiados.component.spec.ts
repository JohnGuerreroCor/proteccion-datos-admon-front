import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CuerposColegiadosComponent } from './cuerpos-colegiados.component';

describe('CuerposColegiadosComponent', () => {
  let component: CuerposColegiadosComponent;
  let fixture: ComponentFixture<CuerposColegiadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CuerposColegiadosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CuerposColegiadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
