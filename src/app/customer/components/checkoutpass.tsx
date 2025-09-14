import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const CheckOutPass = () => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 200); // delay นิดหน่อยให้ smooth
    return () => clearTimeout(timer);
  }, []);

  return (
    <StyledWrapper>
      <div className={`container ${animate ? 'animate' : ''}`}>
        <div className="left-side">
          <div className="card">
            <div className="card-line" />
            <div className="buttons" />
          </div>
          <div className="post">
            <div className="post-line" />
            <div className="screen">
              <div className="dollar">$</div>
            </div>
            <div className="numbers" />
            <div className="numbers-line2" />
          </div>
        </div>
        <div className="right-side"></div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .container {
    background-color: #ffffff;
    display: flex;
    width: 360px;
    height: 160px;
    position: relative;
    border-radius: 6px;
    transition: 0.3s ease-in-out;
    animation: zoomIn 1s ease-in-out forwards;
  }

  .left-side {
    background-color: #5de2a3;
    width: 130px;
    height: 120px;
    border-radius: 4px;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: default;
    transition: 0.3s;
    flex-shrink: 0;
    overflow: hidden;
  }

  .right-side {
    display: flex;
    align-items: center;
    overflow: hidden;
    justify-content: space-between;
    white-space: nowrap;
    transition: 0.3s;
  }

  .new {
    font-size: 23px;
    font-family: 'Lexend Deca', sans-serif;
    margin-left: 20px;
  }

  .card {
    width: 70px;
    height: 46px;
    background-color: #c7ffbc;
    border-radius: 6px;
    position: absolute;
    display: flex;
    z-index: 10;
    flex-direction: column;
    align-items: center;
    box-shadow: 9px 9px 9px -2px rgba(77, 200, 143, 0.72);
  }

  .card-line {
    width: 65px;
    height: 13px;
    background-color: #80ea69;
    border-radius: 2px;
    margin-top: 7px;
  }

  .buttons {
    width: 8px;
    height: 8px;
    background-color: #379e1f;
    box-shadow:
      0 -10px 0 0 #26850e,
      0 10px 0 0 #56be3e;
    border-radius: 50%;
    margin-top: 5px;
    transform: rotate(90deg);
    margin: 10px 0 0 -30px;
  }

  .post {
    width: 63px;
    height: 75px;
    background-color: #dddde0;
    position: absolute;
    z-index: 11;
    bottom: 10px;
    top: 120px;
    border-radius: 6px;
    overflow: hidden;
  }

  .post-line {
    width: 47px;
    height: 9px;
    background-color: #545354;
    position: absolute;
    border-radius: 0px 0px 3px 3px;
    right: 8px;
    top: 8px;
  }

  .post-line:before {
    content: '';
    position: absolute;
    width: 47px;
    height: 9px;
    background-color: #757375;
    top: -8px;
  }

  .screen {
    width: 47px;
    height: 23px;
    background-color: #ffffff;
    position: absolute;
    top: 22px;
    right: 8px;
    border-radius: 3px;
  }

  .numbers {
    width: 12px;
    height: 12px;
    background-color: #838183;
    box-shadow:
      0 -18px 0 0 #838183,
      0 18px 0 0 #838183;
    border-radius: 2px;
    position: absolute;
    transform: rotate(90deg);
    left: 25px;
    top: 52px;
  }

  .numbers-line2 {
    width: 12px;
    height: 12px;
    background-color: #aaa9ab;
    box-shadow:
      0 -18px 0 0 #aaa9ab,
      0 18px 0 0 #aaa9ab;
    border-radius: 2px;
    position: absolute;
    transform: rotate(90deg);
    left: 25px;
    top: 68px;
  }

  .dollar {
    position: absolute;
    font-size: 16px;
    font-family: 'Lexend Deca', sans-serif;
    width: 100%;
    left: 0;
    top: 0;
    color: #4b953b;
    text-align: center;
    opacity: 0;
  }

  /* 🔥 เปลี่ยนจาก hover → auto animate */
  .container.animate .left-side {
    width: 100%;
  }

  .container.animate .card {
    animation: slide-top 1.2s cubic-bezier(0.645, 0.045, 0.355, 1) both;
  }

  .container.animate .post {
    animation: slide-post 1s cubic-bezier(0.165, 0.84, 0.44, 1) both;
  }

  .container.animate .dollar {
    animation: fade-in-fwd 0.3s 1s forwards;
  }

  @keyframes slide-top {
    0% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-70px) rotate(90deg);
    }
    60% {
      transform: translateY(-70px) rotate(90deg);
    }
    100% {
      transform: translateY(-8px) rotate(90deg);
    }
  }

  @keyframes slide-post {
    50% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(-70px);
    }
  }

  @keyframes fade-in-fwd {
    0% {
      opacity: 0;
      transform: translateY(-5px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export default CheckOutPass;
