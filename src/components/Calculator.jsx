import React, { useState } from 'react';
import './Calculator.css';
import { sendAuditEvent } from '../services/api';

const Calculator = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [eventId, setEventId] = useState(1);
  const [lastWasEquals, setLastWasEquals] = useState(false);
  const [numberBuffer, setNumberBuffer] = useState(''); // To accumulate full numbers

  // Function to flush accumulated number buffer into audit event
  const flushNumberBuffer = async () => {
    if (numberBuffer !== '') {
      await sendAuditEvent({
        id: eventId,
        timestamp: Date.now(),
        action: "numberEntered",
        value: numberBuffer
      });
      setEventId(prev => prev + 1);
      setNumberBuffer('');
    }
  };

  // Function to handle all button clicks
  const handleButtonClick = (value) => {
    const translatedValue = value === 'x' ? '*' : value === '÷' ? '/' : value;
    let newInput = '';

    if (lastWasEquals && ['+', '-', '*', '/'].includes(translatedValue)) {
      // After equals and operator pressed -> continue with result
      newInput = `${result}${translatedValue}`;
      setInput(newInput);
      setResult(''); 
      setLastWasEquals(false);
    } else if (lastWasEquals) {
      // After equals and number pressed -> start fresh
      newInput = translatedValue;
      setInput(newInput);
      setResult('');
      setLastWasEquals(false);
    } else {
      newInput = input + translatedValue;
      setInput(newInput);
    }

    // Handle audit logging
    if (['+', '-', '*', '/'].includes(translatedValue)) {
      flushNumberBuffer();
      sendAuditEvent({
        id: eventId + 1,
        timestamp: Date.now(),
        action: "operatorEntered",
        value: value
      });
      setEventId(prev => prev + 2);
    } else if (value === '=') {
      flushNumberBuffer();
      sendAuditEvent({
        id: eventId + 1,
        timestamp: Date.now(),
        action: "equalsPressed",
        value: "="
      });
      setEventId(prev => prev + 2);
    } else {
      setNumberBuffer(prev => prev + value);
    }
  };

  // Function to calculate result when '=' pressed
  const handleCalculate = () => {
    try {
      const evalResult = eval(input);
      setResult(evalResult);
      setLastWasEquals(true);
    } catch (error) {
      setResult('Error');
    }
  };

  // Function to clear everything when "Clear" pressed
  const handleClear = () => {
    setInput('');
    setResult('');
    setLastWasEquals(false);
    setNumberBuffer('');

    sendAuditEvent({
      id: eventId,
      timestamp: Date.now(),
      action: "clearPressed",
      value: "clear"
    });
    setEventId(prev => prev + 1);
  };

  return (
    <div className="container">
      <div className="calculator">
        {/* Display input and result */}
        <div className="display">
          <div>{input}</div>
          <div>{result}</div>
        </div>

        {/* Buttons */}
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
              onClick={() => {
                if (btn === '=') {
                  handleCalculate();
                }
                handleButtonClick(btn);
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
