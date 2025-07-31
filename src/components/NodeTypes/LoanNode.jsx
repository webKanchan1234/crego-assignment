import React from "react";

const LoanNode = ({ data }) => (
  <div className="bg-yellow-200 border border-yellow-600 rounded px-3 py-2 shadow">
    <strong>Loan</strong>
    <div>{data.label}</div>
  </div>
);
export default LoanNode;