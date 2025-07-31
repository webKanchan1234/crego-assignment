import React from "react";

const CollateralNode = ({ data }) => (
  <div className="bg-gray-200 border border-gray-600 rounded px-3 py-2 shadow">
    <strong>Collateral</strong>
    <div>{data.label}</div>
  </div>
);
export default CollateralNode;