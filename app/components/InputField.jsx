"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function InputField({
  label,
  type = "text",
  name,
  value,
  placeholder,
  onChange,
  required = false,
}) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="relative w-full">
      {/* Label + required asterisk */}
      <label className="text-[var(--text-main)] font-semibold text-sm sm:text-base flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>

      {/* Input Field */}
      <input
        type={inputType}
        name={name}
        required={required}
        onChange={onChange}
        value={value}
        placeholder={placeholder}
        className={`w-full mt-1 px-4 py-2 ${
          isPassword ? "pr-12" : "pr-4"
        } bg-(--placeholder-bg) dark:bg-black/20 border-yellow-200 border-2
        text-[var(--text-main)] placeholder-(--placeholder-text) rounded-lg
        focus:ring-2 focus:ring-yellow-400 focus:outline-none transition-colors`}
      />

      {/* Password Toggle Icon */}
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-[70%] -translate-y-1/2 text-gray-500 hover:text-gray-700 flex items-center"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      )}
    </div>
  );
}
