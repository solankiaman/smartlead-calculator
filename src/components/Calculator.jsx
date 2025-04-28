import React, { useState } from 'react';
import './Calculator.css';
import { sendAuditEvent } from '../services/api';

const Calculator = () => {
  // States for input, result, event tracking
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [eventId, setEventId] = useState(1);
  const [lastWasEquals, setLastWasEquals] = useState(false); // to check if last action was '='

  // Function to handle number and operator button clicks
  const handleButtonClick = (value) => {
    const translatedValue = value === 'x' ? '*' : value === '÷' ? '/' : value;
    let newInput = '';

    if (lastWasEquals && ['+', '-', '*', '/'].includes(translatedValue)) {
      // Continue with result but clear it from display
      newInput = `${result}${translatedValue}`;
      setResult(''); // Clear result for clean new chain
    } else {
      newInput = input + translatedValue;
    }

    setInput(newInput);
    setLastWasEquals(false);

    // Send audit log
    sendAuditEvent({
      id: eventId,
      timestamp: Date.now(),
      action: isNaN(translatedValue) && translatedValue !== '.' ? "operatorEntered" : "numberEntered",
      value: value
    });

    setEventId(eventId + 1);
  };

  // Function to calculate the result when "=" is pressed
  const handleCalculate = () => {
    try {
      const evalResult = eval(input);
      setResult(evalResult);
      setLastWasEquals(true);

      sendAuditEvent({
        id: eventId,
        timestamp: Date.now(),
        action: "equalsPressed",
        value: "="
      });

      setEventId(eventId + 1);
    } catch (error) {
      setResult('Error'); // If invalid input
    }
  };

  // Function to reset everything when Clear is clicked
  const handleClear = () => {
    setInput('');
    setResult('');
    setLastWasEquals(false);

    sendAuditEvent({
      id: eventId,
      timestamp: Date.now(),
      action: "clearPressed",
      value: "clear"
    });

    setEventId(eventId + 1);
  };

  return (
    <div className="container">
      <div className="calculator">
        {/* Display input and result */}
        <div className="display">
          <div>{input}</div>
          <div>{result}</div>
        </div>

        {/* All calculator buttons */}
        <div className="button-grid">
          {['7','8','9','+','4','5','6','-','1','2','3','x','0','.','=','÷'].map((btn) => (
            <button
              key={btn}
              className={`button ${
                btn === '+' ? 'plus' :
                btn === '-' ? 'minus' :
                btn === 'x' ? 'multiply' :
                btn === '÷' ? 'divide' :
                btn === '=' ? 'equals' :
                ''
              }`}
              onClick={() => {
                if (btn === '=') {
                  handleCalculate();
                } else {
                  handleButtonClick(btn);
                }
              }}
            >
              {btn}
            </button>
          ))}

          {/* Clear button */}
          <button className="button clear" onClick={handleClear}>Clear</button>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
