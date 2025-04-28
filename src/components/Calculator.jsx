import React, { useState } from 'react';
import './Calculator.css';
import { sendAuditEvent } from '../services/api';

const Calculator = () => {
    
  // States to manage input, result, audit event id, last action, and number accumulation
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [eventId, setEventId] = useState(1);
  const [lastWasEquals, setLastWasEquals] = useState(false);
  const [numberBuffer, setNumberBuffer] = useState('');

  // Function to send accumulated number as a single audit event
  const flushNumberBuffer = async (localEventId) => {
    if (numberBuffer !== '') {
      await sendAuditEvent({
        id: localEventId,
        timestamp: Date.now(),
        action: "numberEntered",
        value: numberBuffer
      });
      setNumberBuffer('');
      return 1; // 1 event was sent
    }
    return 0; // no event sent
  };

  // Function to handle number/operator button click (except '=')
  const handleButtonClick = async (value) => {
    let localEventId = eventId; // Start from current eventId

    const translatedValue = value === 'x' ? '*' : value === '÷' ? '/' : value;
    let newInput = '';

    // Smart handling after '=' was pressed
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
    
    // Handle audit events
    if (['+', '-', '*', '/'].includes(translatedValue)) {
      const flushed = await flushNumberBuffer(localEventId);
      localEventId += flushed;
      await sendAuditEvent({
        id: localEventId,
        timestamp: Date.now(),
        action: "operatorEntered",
        value: value
      });
      localEventId += 1;
      setEventId(localEventId); // Update after all
    } else if (value === '=') {
      // No audit from here, handled in handleCalculate()
    } else {
      // Keep accumulating number in buffer
      setNumberBuffer(prev => prev + value);
    }
  };

  // Function to handle '=' button click and result calculation
  const handleCalculate = async () => {
    try {
      let localEventId = eventId; // Start from current eventId

      const flushed = await flushNumberBuffer(localEventId);
      localEventId += flushed;

      const evalResult = eval(input);
      setResult(evalResult);
      setLastWasEquals(true);

      // Send equals pressed event
      await sendAuditEvent({
        id: localEventId,
        timestamp: Date.now(),
        action: "equalsPressed",
        value: "="
      });
      localEventId += 1;

      // Send calculated result as a new audit event
      await sendAuditEvent({
        id: localEventId,
        timestamp: Date.now(),
        action: "resultCalculated",
        value: String(evalResult)
      });
      localEventId += 1;

      setEventId(localEventId); // Update after all
    } catch (error) {
      setResult('Error');
    }
  };

  // Function to clear calculator and reset everything
  const handleClear = async () => {
    let localEventId = eventId;

    setInput('');
    setResult('');
    setLastWasEquals(false);
    setNumberBuffer('');
    
    // Send clear pressed event
    await sendAuditEvent({
      id: localEventId,
      timestamp: Date.now(),
      action: "clearPressed",
      value: "clear"
    });
    localEventId += 1;

    setEventId(localEventId);
  };

  return (
    <div className="container">
      <div className="calculator">
        <div className="display">
          <div>{input}</div>
          <div>{result}</div>
        </div>

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
                  await handleCalculate();
                } else {
                  await handleButtonClick(btn);
                }
              }}
            >
              {btn}
            </button>
          ))}

          <button className="button clear" onClick={handleClear}>Clear</button>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
