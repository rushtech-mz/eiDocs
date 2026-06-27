"use client";

import React from "react";

interface AuthButtonProps {
  text: string;
  onClick?: () => void;
}

const AuthButton: React.FC<AuthButtonProps> = ({ text, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition"
    >
      {text}
    </button>
  );
};

export default AuthButton;
