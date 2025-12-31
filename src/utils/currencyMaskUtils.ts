import { Ref, watch } from 'vue';

export function formatToBRL(value: string | number | null | undefined): string {
  if (value == null || value === '') return '';

  let numberValue: number;

  if (typeof value === 'number') {
    numberValue = value;
  } else {
    const cleaned = value.replace(/[R$\s]/g, '');
    const normalized = cleaned.replace(',', '.');
    numberValue = parseFloat(normalized);
  }

  if (isNaN(numberValue)) return '';

  return numberValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function useCurrencyMask(valueRef: Ref<string | number | null | undefined>): void {
  watch(valueRef, (newVal: string | number | null | undefined) => {
    if (newVal == null || newVal === '') return;

    let numericString = '';

    if (typeof newVal === 'number') {
      numericString = newVal.toString();
    } else {
      numericString = newVal.replace(/\D/g, '');
    }

    if (numericString.length === 0) {
      valueRef.value = '';
      return;
    }

    const numericValue = parseFloat(numericString) / 100;

    if (!isNaN(numericValue)) {
      valueRef.value = formatToBRL(numericValue);
    }
  });
}

export function parseBRL(str: string | null | undefined): number {
  if (!str) return 0;
  const clean: string = String(str).replace(/[^\d,]/g, '');
  const normalized: string = clean.replace(',', '.');
  const num: number = parseFloat(normalized);
  return isNaN(num) ? 0 : num;
}
