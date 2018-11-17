import {FormGroup, ValidationErrors, ValidatorFn} from '@angular/forms';

export const nombreFiscalValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
  const categoriaIVA = control.get('categoriaIVA');
  const nombreFiscal = control.get('nombreFiscal');

  return categoriaIVA && nombreFiscal && categoriaIVA.value !== 'CONSUMIDOR_FINAL' && nombreFiscal.value === '' ?
    { 'requiredNombreFiscal': true } : null;
};
