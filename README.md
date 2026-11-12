# Scientific Calculator

A simple calculator with a set of scientific functions, built with plain HTML, CSS and JavaScript. It has no dependencies, no build step and no frameworks.

## Features

- **Basic operations:** addition, subtraction, multiplication, division, decimals and parentheses
- **Scientific functions:** `sin`, `cos`, `tan`, `log` (base 10), `ln`, square root, square (`x²`), power (`xʸ`), factorial (`n!`), reciprocal (`1/x`) and percent (`%`)
- **Constants:** `π` and `e`
- **Angle mode:** switch between degrees (DEG) and radians (RAD) for trigonometric functions
- **Ans key:** reuse the previous result in a new calculation
- **Edit controls:** `DEL` removes the last entry (a whole function such as `sin(` is removed at once), `AC` clears everything and `±` toggles the sign
- **Implicit multiplication:** `2π` and `3(4+1)` work without typing `×`
- **Auto-closing parentheses:** missing `)` characters are added when you press `=`
- **Error handling:** invalid input such as dividing by zero, `√(−1)` or `log(0)` shows `Error` instead of breaking the calculator
- **Responsive design:** works on desktop and mobile screens
- **Light and dark theme:** follows your device's color scheme automatically

## Project Structure

```
calculator/
├── index.html   # Page structure
├── style.css    # Layout, colors and light/dark themes
├── script.js    # Calculator logic and expression parser
└── README.md    # This file
```

## How to Run

1. Download and extract the project folder.
2. Open `index.html` in any modern web browser (Chrome, Edge, Firefox, Safari).

Keep all files in the same folder so the page can load its stylesheet and script.

## How to Use

Click the buttons or use your keyboard. Press `=` or `Enter` to calculate.

| Key | Action |
| --- | --- |
| `0`–`9`, `.` | Enter numbers |
| `+`, `-`, `*`, `/` | Add, subtract, multiply, divide |
| `^` | Power |
| `!` | Factorial |
| `%` | Percent (divides by 100) |
| `(`, `)` | Parentheses |
| `p` | Insert π |
| `Enter` or `=` | Calculate |
| `Backspace` | Delete last entry |
| `Esc` or `Delete` | Clear all |

### Examples

| Input | Result |
| --- | --- |
| `sin(30)` (DEG mode) | `0.5` |
| `√(16)+2^3` | `12` |
| `5!` | `120` |
| `2π` (RAD mode) | `6.28318530718` |
| `50%` | `0.5` |
| `log(1000)` | `3` |

## How It Works

The calculator does not use `eval()`. Instead, `script.js` includes its own small expression parser that:

1. Splits the typed expression into tokens (numbers, operators, functions and constants).
2. Parses the tokens using recursive descent, which respects the order of operations: parentheses, then powers and factorials, then multiplication and division, then addition and subtraction.
3. Calculates the result and rounds it to 12 significant digits to avoid floating-point noise (for example, `sin(180)` returns `0` instead of `1.22e-16`).

## Limitations

- Factorial only works on whole numbers from 0 to 170.
- Trigonometric inverse functions (`asin`, `acos`, `atan`) and hyperbolic functions are not included.
- There is no calculation history or memory storage (`M+`, `M−`) beyond the `Ans` key.

## Browser Support

Works in all current versions of Chrome, Edge, Firefox and Safari.

## License

Free to use and modify for learning and personal projects.
