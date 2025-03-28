import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NormativaGrupoComponent } from './normativa-grupo.component';

describe('NormativaGrupoComponent', () => {
  let component: NormativaGrupoComponent;
  let fixture: ComponentFixture<NormativaGrupoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NormativaGrupoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NormativaGrupoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
