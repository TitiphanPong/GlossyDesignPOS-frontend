import React from 'react';
import styled from 'styled-components';

const Card = () => {
  return (
    <StyledWrapper>
      <div className="container">
        <div className="left-side">
          <div className="card">
            <div className="card-line" />
            <div className="buttons" />
          </div>
          <div className="post">
            <div className="post-line" />
            <div className="screen">
              <div className="icon">!</div>
            </div>
            <div className="numbers" />
            <div className="numbers-line2" />
          </div>
        </div>
        <div className="right-side">
          <div className="new">New Alert</div>
          <svg
            className="arrow"
            xmlns="http://www.w3.org/2000/svg"
            width={512}
            height={512}
            viewBox="0 0 451.846 451.847">
            <path
              d="M345.441 248.292L151.154 442.573c-12.359 12.365-32.397 12.365-44.75 0-12.354-12.354-12.354-32.391 0-44.744L278.318 225.92 106.409 54.017c-12.354-12.359-12.354-32.394 0-44.748 12.354-12.359 32.391-12.359 44.75 0l194.287 194.284c6.177 6.18 9.262 14.271 9.262 22.366 0 8.099-3.091 16.196-9.267 22.373z"
              className="active-path"
              fill="#e0f7fa"
            />
          </svg>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .container {
    background-color: #e0f7fa; /* Light teal background */
    display: flex;
    width: 250px;
    height: 75px;
    position: relative;
    border-radius: 5px;
    transition:
      transform 0.3s ease-in-out,
      box-shadow 0.3s ease-in-out;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }

  .container:hover {
    transform: scale(1.03);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .container:hover .left-side {
    width: 100%;
  }

  .left-side {
    background: linear-gradient(135deg, #26a69a, #4dd0e1); /* Teal gradient */
    width: 85px;
    height: 75px;
    border-radius: 4px 0 0 4px;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: width 0.3s ease-in-out;
    flex-shrink: 0;
    overflow: hidden;
  }

  .right-side {
    width: calc(100% - 85px);
    display: flex;
    align-items: center;
    overflow: hidden;
    cursor: pointer;
    justify-content: space-between;
    white-space: nowrap;
    position: relative;
    transition: background-color 0.3s ease-in-out;
  }

  .right-side:hover {
    background-color: #b2ebf2; /* Lighter teal hover */
  }

  .right-side::before {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    transition:
      width 0.4s ease-out,
      height 0.4s ease-out;
  }

  .right-side:hover::before {
    width: 200px;
    height: 200px;
    opacity: 0;
  } /* Ripple effect on hover */

  .arrow {
    width: 14px;
    height: 14px;
    margin-right: 12px;
    transition: transform 0.3s ease-in-out;
  }

  .right-side:hover .arrow {
    transform: translateX(5px);
  } /* Arrow slides right on hover */

  .new {
    font-size: 15px;
    font-family: 'Inter', sans-serif;
    margin-left: 12px;
    color: #1a3c34;
    transition: color 0.3s ease-in-out;
  }

  .right-side:hover .new {
    color: #00695c; /* Darker teal on hover */
  }

  .card {
    width: 48px;
    height: 30px;
    background-color: #80deea; /* Light teal */
    border-radius: 4px;
    position: absolute;
    display: flex;
    z-index: 10;
    flex-direction: column;
    align-items: center;
    box-shadow: 5px 5px 5px -2px rgba(38, 166, 154, 0.4);
  }

  .card-line {
    width: 42px;
    height: 8px;
    background-color: #b2ebf2; /* Lighter teal */
    border-radius: 1px;
    margin-top: 4px;
  }

  @media only screen and (max-width: 480px) {
    .container {
      transform: scale(0.6);
    }

    .container:hover {
      transform: scale(0.63);
    }

    .new {
      font-size: 13px;
    }
  }

  .buttons {
    width: 5px;
    height: 5px;
    background-color: #00796b; /* Dark teal */
    box-shadow:
      0 -6px 0 0 #004d40,
      0 6px 0 0 #26a69a;
    border-radius: 50%;
    margin-top: 3px;
    transform: rotate(90deg);
    margin: 6px 0 0 -18px;
  }

  .container:hover .card {
    animation: slide-top 0.9s cubic-bezier(0.68, -0.55, 0.265, 1.55) both;
  }

  .container:hover .post {
    animation: slide-post 0.7s cubic-bezier(0.23, 1, 0.32, 1) both;
  }

  @keyframes slide-top {
    0% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-45px) rotate(90deg);
    }
    60% {
      transform: translateY(-45px) rotate(90deg);
    }
    100% {
      transform: translateY(-5px) rotate(90deg);
    }
  }

  .post {
    width: 42px;
    height: 50px;
    background-color: #f5f5f5;
    position: absolute;
    z-index: 11;
    bottom: 6px;
    top: 75px;
    border-radius: 4px;
    overflow: hidden;
  }

  .post-line {
    width: 32px;
    height: 5px;
    background-color: #555;
    position: absolute;
    border-radius: 0 0 2px 2px;
    right: 5px;
    top: 5px;
  }

  .post-line:before {
    content: '';
    position: absolute;
    width: 32px;
    height: 5px;
    background-color: #777;
    top: -5px;
  }

  .screen {
    width: 32px;
    height: 15px;
    background-color: #ffffff;
    position: absolute;
    top: 14px;
    right: 5px;
    border-radius: 2px;
  }

  .numbers {
    width: 7px;
    height: 7px;
    background-color: #888;
    box-shadow:
      0 -11px 0 0 #888,
      0 11px 0 0 #888;
    border-radius: 1px;
    position: absolute;
    transform: rotate(90deg);
    left: 17px;
    top: 34px;
  }

  .numbers-line2 {
    width: 7px;
    height: 7px;
    background-color: #aaa;
    box-shadow:
      0 -11px 0 0 #aaa,
      0 11px 0 0 #aaa;
    border-radius: 1px;
    position: absolute;
    transform: rotate(90deg);
    left: 17px;
    top: 45px;
  }

  @keyframes slide-post {
    50% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(-45px);
    }
  }

  .icon {
    position: absolute;
    font-size: 11px;
    font-family: 'Inter', sans-serif;
    width: 100%;
    left: 0;
    top: 0;
    color: #d32f2f; /* Red for alert */
    text-align: center;
    animation: bounce 2s infinite;
  }

  .container:hover .icon {
    animation:
      fade-in-fwd 0.3s 0.7s backwards,
      bounce 2s infinite;
  }

  @keyframes fade-in-fwd {
    0% {
      opacity: 0;
      transform: translateY(-3px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes bounce {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-2px);
    }
  }
`;

export default Card;
