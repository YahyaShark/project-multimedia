function randomDigits(length: number) {
  let result = "";

  for (let index = 0; index < length; index += 1) {
    result += Math.floor(Math.random() * 10).toString();
  }

  return result;
}

export function formatBankNumber(value: string) {
  return value.match(/.{1,4}/g)?.join(" ") ?? value;
}

export function generateAccountNumber() {
  return `53${randomDigits(10)}`;
}

export function generateCardNumber() {
  return `4${randomDigits(15)}`;
}
