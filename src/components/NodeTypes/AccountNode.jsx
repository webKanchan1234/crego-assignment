import React from "react";


const AccountNode = ({ data }) => (
  <div className="bg-blue-200 border border-blue-600 rounded px-3 py-2 shadow">
    <strong>Account</strong>
    <div>{data.label}</div>
  </div>
);
export default AccountNode;