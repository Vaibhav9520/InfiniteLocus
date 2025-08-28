import React from "react";

export default function Toast({ message, type }) {
  return (
    <div className={`fixed bottom-5 right-5 p-3 rounded-lg shadow-md text-white ${
      type === "success" ? "bg-green-600" : "bg-red-600"
    }`}>
      {message}
    </div>
  );
}
