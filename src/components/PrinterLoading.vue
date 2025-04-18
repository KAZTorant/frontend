<template>
    <div class="loader-container">
      <div class="loader-printer">
        <div class="printer-body">
          <div class="printer-head"></div>
          <div class="printer-buttons">
            <div class="btnn red"></div>
            <div class="btnn green"></div>
          </div>
          <div class="printer-slot"></div>
        </div>
        <div class="receipt">
          <div class="receipt-header">KAZZA...</div>
          <div class="receipt-lines">
            <div class="line" v-for="n in 7" :key="n" :style="getLineDelay(n)"></div>
          </div>
          <div class="receipt-footer">Təşəkkür edirik!</div>
        </div>
        <div class="checkmark"><i class="fas fa-check"></i></div>
      </div>
    </div>
  </template>
  
  <script setup>
  const getLineDelay = (n) => {
    return { animationDelay: `${0.2 + n * 0.2}s` };
  };
  </script>
  
  <style scoped>
  @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

  .loader-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    color: #e5e7eb;
    overflow: hidden;
  }
  
  .loader-printer {
    position: relative;
    width: 160px;
    height: 100px;
  }
  
  .printer-body {
    position: absolute;
    width: 160px;
    height: 100px;
    background: #1e293b;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    overflow: hidden;
    animation: body-pulse 2s ease-in-out infinite;
  }
  
  .printer-head {
    position: absolute;
    top: 0;
    left: 0;
    width: 160px;
    height: 20px;
    background: #111827;
  }
  
  .printer-buttons {
    position: absolute;
    top: 6px;
    right: 10px;
    display: flex;
    gap: 6px;
  }
  
  .printer-buttons .btnn {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
  .printer-buttons .red { background: #ef4444; box-shadow: 0 0 6px #ef4444; }
  .printer-buttons .green { background: #10b981; box-shadow: 0 0 6px #10b981; }
  
  .printer-slot {
    position: absolute;
    bottom: 8px;
    left: 30px;
    width: 100px;
    height: 8px;
    background: #374151;
    border-radius: 4px;
  }
  .printer-slot::after {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 6px;
    box-shadow: 0 0 12px rgba(46,204,113,0.8),
                0 0 24px rgba(46,204,113,0.5),
                0 0 36px rgba(46,204,113,0.3);
    animation: slot-glow 1.5s ease-in-out infinite;
  }
  
  .receipt {
    position: absolute;
    top: 80px;
    left: 30px;
    width: 100px;
    height: 0;
    overflow: hidden;
    background: #f9fafb;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    animation: print 3s ease-in-out infinite;
  }
  
  .receipt-header,
  .receipt-footer {
    text-align: center;
    font-size: 10px;
    color: #374151;
    padding: 4px 0;
  }
  .receipt-header { font-weight: bold; }
  .receipt-footer { font-style: italic; }
  
  .receipt-lines {
    padding: 0 10px;
    margin: 2px 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
    height: 70px;
  }
  .receipt-lines .line {
    height: 2px;
    width: 0;
    background: #d1d5db;
    border-radius: 2px;
    animation: line-print 3s ease infinite;
  }
  
  .checkmark {
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 20px;
    color: #22c55e;
    opacity: 0;
    animation: show-check 3s ease-in-out infinite;
  }
  
  @keyframes print {
    0%   { height: 0; opacity: 0; }
    20%  { height: 40px; opacity: 1; }
    40%  { height: 80px; }
    70%  { transform: translateY(5px) rotate(-1deg); }
    90%  { transform: translateY(-2px) rotate(1deg); }
    100% { height: 0; opacity: 0; transform: none; }
  }
  
  @keyframes line-print {
    0%   { width: 0; }
    40%  { width: 84%; }
    100% { width: 0; }
  }
  
  @keyframes show-check {
    0%, 60%   { opacity: 0; transform: translateX(-50%) scale(0); }
    65%, 85%  { opacity: 1; transform: translateX(-50%) scale(1); }
    100%      { opacity: 0; transform: translateX(-50%) scale(0); }
  }
  
  @keyframes body-pulse {
    0%,100% { box-shadow: 0 4px 8px rgba(0,0,0,0.3); }
    50%     { box-shadow: 0 6px 12px rgba(0,0,0,0.5); }
  }
  
  @keyframes slot-glow {
    0%,100% { box-shadow: 0 0 12px rgba(46,204,113,0.8); }
    50%     { box-shadow: 0 0 24px rgba(46,204,113,0.5); }
  }
  </style>
  