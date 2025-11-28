import React from "react";

interface Props {
  label: string;
  description: string;
  value: number;
  onChange: (val: number) => void;
}

export default function SliderInput({ label, description, value, onChange }: Props) {
  return (
    <div className="mb-2">
      <label className="form-label">
        {label}: {value} <small className="text-muted">({description})</small>
      </label>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        className="form-range"
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
