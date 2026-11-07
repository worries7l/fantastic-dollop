const display = document.querySelector("#display");
const expression = document.querySelector("#expression");
const keys = document.querySelector("#calculator-keys");

let currentValue = "0";
let storedValue = null;
let operator = null;
let waitingForOperand = false;

function render() {
  display.textContent = currentValue;
  expression.textContent = storedValue !== null && operator
    ? `${formatNumber(storedValue)} ${operator}`
    : "";
}

function formatNumber(value) {
  return Number(value).toLocaleString("en-US", { maximumFractionDigits: 10 });
}

function inputNumber(number) {
  if (currentValue === "Error" || waitingForOperand) {
    currentValue = number;
    waitingForOperand = false;
  } else if (currentValue.replace("-", "").replace(".", "").length < 12) {
    currentValue = currentValue === "0" ? number : currentValue + number;
  }
  render();
}

function inputDecimal() {
  if (currentValue === "Error" || waitingForOperand) {
    currentValue = "0.";
    waitingForOperand = false;
  } else if (!currentValue.includes(".")) {
    currentValue += ".";
  }
  render();
}

function calculate(left, right, operation) {
  switch (operation) {
    case "+": return left + right;
    case "−": return left - right;
    case "×": return left * right;
    case "÷": return right === 0 ? NaN : left / right;
    default: return right;
  }
}

function formatResult(value) {
  if (!Number.isFinite(value)) return "Error";
  const rounded = Number(value.toPrecision(10));
  return String(rounded).slice(0, 14);
}

function chooseOperator(nextOperator) {
  const inputValue = Number(currentValue);
  if (!Number.isFinite(inputValue)) return;

  if (operator && !waitingForOperand) {
    const result = calculate(storedValue, inputValue, operator);
    currentValue = formatResult(result);
    if (currentValue === "Error") {
      storedValue = null;
      operator = null;
      waitingForOperand = true;
      render();
      return;
    }
    storedValue = Number(currentValue);
  } else {
    storedValue = inputValue;
  }

  operator = nextOperator;
  waitingForOperand = true;
  render();
}

function showResult() {
  if (!operator || storedValue === null || waitingForOperand) return;
  const result = calculate(storedValue, Number(currentValue), operator);
  expression.textContent = `${formatNumber(storedValue)} ${operator} ${formatNumber(currentValue)} =`;
  currentValue = formatResult(result);
  storedValue = null;
  operator = null;
  waitingForOperand = true;
  display.textContent = currentValue;
}

function clear() {
  currentValue = "0";
  storedValue = null;
  operator = null;
  waitingForOperand = false;
  render();
}

function performAction(action) {
  switch (action) {
    case "clear": clear(); break;
    case "decimal": inputDecimal(); break;
    case "equals": showResult(); break;
    case "sign":
      if (currentValue !== "0" && currentValue !== "Error") {
        currentValue = currentValue.startsWith("-") ? currentValue.slice(1) : `-${currentValue}`;
        render();
      }
      break;
    case "percent":
      if (currentValue !== "Error") {
        currentValue = formatResult(Number(currentValue) / 100);
        render();
      }
      break;
  }
}

keys.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.number !== undefined) inputNumber(button.dataset.number);
  else if (button.dataset.operator) chooseOperator(button.dataset.operator);
  else if (button.dataset.action) performAction(button.dataset.action);
});

document.addEventListener("keydown", (event) => {
  if (/^[0-9]$/.test(event.key)) inputNumber(event.key);
  else if (event.key === ".") inputDecimal();
  else if (event.key === "Enter" || event.key === "=") showResult();
  else if (event.key === "Escape") clear();
  else if (event.key === "Backspace") {
    if (!waitingForOperand && currentValue !== "Error") {
      currentValue = currentValue.length > 1 ? currentValue.slice(0, -1) : "0";
      if (currentValue === "-") currentValue = "0";
      render();
    }
  } else {
    const operators = { "+": "+", "-": "−", "*": "×", "/": "÷" };
    if (operators[event.key]) {
      event.preventDefault();
      chooseOperator(operators[event.key]);
    }
  }
});

render();
