import React, { useState } from 'react';
import './Calculator.css';
import { sendAuditEvent } from '../services/api';

const Calculator = () => {
  // States to manage input, result, and audit logging behavior
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [lastWasEquals, setLastWasEquals] = useState(false); // To track if last action was '='
  const [numberBuffer, setNumberBuffer] = useState('');       // To accumulate full numbers

  // Flush accumulated numberBuffer into audit log
  const flushNumberBuffer = async () => {
    if (numberBuffer !== '') {
      await sendAuditEvent({
        timestamp: Date.now(),
        action: "numberEntered",
        value: numberBuffer
      });
      setNumberBuffer(''); // Reset buffer after sending
    }
  };

  // Handle click for number and operator buttons
  const handleButtonClick = async (value) => {
    const translatedValue = value === 'x' ? '*' : value === '÷' ? '/' : value;
    let newInput = '';

    // If last action was '=', start new calculation
    if (lastWasEquals && ['+', '-', '*', '/'].includes(translatedValue)) {
      newInput = `${result}${translatedValue}`;
      setInput(newInput);
      setResult('');
      setLastWasEquals(false);
    } else if (lastWasEquals) {
      newInput = translatedValue;
      setInput(newInput);
      setResult('');
      setLastWasEquals(false);
    } else {
      newInput = input + translatedValue;
      setInput(newInput);
    }

    // If operator button clicked, flush numberBuffer and log operator
    if (['+', '-', '*', '/'].includes(translatedValue)) {
      await flushNumberBuffer();
      await sendAuditEvent({
        timestamp: Date.now(),
        action: "operatorEntered",
        value: value
      });
    } 
    // Ignore '=' here, '=' is handled separately in handleCalculate
    else if (value === '=') {
      // Do nothing here
    } 
    // If number or '.' clicked, keep accumulating in numberBuffer
    else {
      setNumberBuffer(prev => prev + value);
    }
  };

  // Handle '=' button: Calculate result and send audit logs
  const handleCalculate = async () => {
    try {
      await flushNumberBuffer(); // Flush pending number first

      const evalResult = eval(input); // Evaluate expression
      setResult(evalResult);
      setLastWasEquals(true);

      // Log '=' pressed event
      await sendAuditEvent({
        timestamp: Date.now(),
        action: "equalsPressed",
        value: "="
      });

      // Log calculated result event
      await sendAuditEvent({
        timestamp: Date.now(),
        action: "resultCalculated",
        value: String(evalResult)
      });
    } catch (error) {
      setResult('Error'); // If evaluation fails, show Error
    }
  };

  // Handle Clear button: Reset everything
  const handleClear = async () => {
    setInput('');
    setResult('');
    setLastWasEquals(false);
    setNumberBuffer('');

    // Log clear action
    await sendAuditEvent({
      timestamp: Date.now(),
      action: "clearPressed",
      value: "clear"
    });
  };

  return (
    <div className="container">
      <div className="calculator">
        {/* Display current input and result */}
        <div className="display">
          <div>{input}</div>
          <div>{result}</div>
        </div>

        {/* Grid of calculator buttons */}
        <div className="button-grid">
          {['7', '8', '9', '+', '4', '5', '6', '-', '1', '2', '3', 'x', '0', '.', '=', '÷'].map((btn) => (
            <button
              key={btn}
              className={`button ${
                btn === '+' ? 'plus' :
                btn === '-' ? 'minus' :
                btn === 'x' ? 'multiply' :
                btn === '÷' ? 'divide' :
                btn === '=' ? 'equals' : ''
              }`}
              onClick={async () => {
                if (btn === '=') {
                  await handleCalculate();  // '=' clicked
                } else {
                  await handleButtonClick(btn); // Number or operator clicked
                }
              }}
            >
              {btn}
            </button>
          ))}
          {/* Clear Button */}
          <button className="button clear" onClick={handleClear}>Clear</button>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
