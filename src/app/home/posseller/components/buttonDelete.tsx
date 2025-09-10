import React from 'react';
import styled from 'styled-components';

type ButtonDeleteProps = {
  onClick?: () => void;
};

const ButtonDelete: React.FC<ButtonDeleteProps> = ({ onClick }) => {
  return (
    <StyledWrapper>
      <button className="Btn" onClick={onClick}>
        Delete
        <svg className="svg" viewBox="0 0 512 512">
          <path
            d="M135.2 17.7C140.7 7.4 151.6 0 163.8 0h120.4c12.2 0 23.1 7.4 28.6 17.7L328 32h88c13.3 0 24 10.7 24 24s-10.7 24-24 24h-8v368c0 
  35.3-28.7 64-64 64H104c-35.3 0-64-28.7-64-64V80H32C18.7 80 8 69.3 8 
  56s10.7-24 24-24h88l15.2-14.3zM128 128v304c0 8.8 7.2 16 16 
  16h160c8.8 0 16-7.2 16-16V128H128z"
          />
        </svg>
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .Btn {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 100px;
    height: 40px;
    border: none;
    padding: 0px 20px;
    background-color: rgba(235, 30, 30, 1);
    color: white;
    font-weight: 500;
    cursor: pointer;
    border-radius: 10px;
    box-shadow: 5px 5px 0px rgba(0, 0, 0, 1);
    transition-duration: 0.3s;
  }

  .svg {
    width: 13px;
    position: absolute;
    right: 0;
    margin-right: 20px;
    fill: white;
    transition-duration: 0.3s;
  }

  .Btn:hover {
    color: transparent;
  }

  .Btn:hover svg {
    right: 43%;
    margin: 0;
    padding: 0;
    border: none;
    transition-duration: 0.3s;
  }

  .Btn:active {
    transform: translate(3px, 3px);
    transition-duration: 0.3s;
    box-shadow: 2px 2px 0px rgba(0, 0, 0, 1);
  }
`;

export default ButtonDelete;
