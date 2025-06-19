"use client";

import React, { ReactNode, useRef, useEffect, useState } from "react";
import {
  Controller,
  FieldPath,
  FieldValues,
  useFormContext,
} from "react-hook-form";
import { gsap } from "gsap";

// Ikon importları
import { EmailIcon } from "@/components/ui/EmailIcon";
import { PasswordIcon } from "@/components/ui/PasswordIcon";

// Form elemanları için tip tanımı
type InputType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "tel"
  | "url"
  | "search"
  | "date"
  | "time"
  | "datetime-local"
  | "month"
  | "week"
  | "color"
  | "file"
  | "textarea"
  | "select"
  | "checkbox"
  | "radio"
  | "toggle"
  | "range"
  | "custom";

// Select options için tip tanımı
interface SelectOption {
  value: string;
  label: string;
}

// FormField için prop tanımı
interface FormFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> {
  name: TName;
  type?: InputType;
  label?: string;
  description?: string;
  placeholder?: string;
  icon?: ReactNode;
  options?: SelectOption[];
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  cols?: number;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  required?: boolean;
  pattern?: string;
  autoComplete?: string;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  descriptionClassName?: string;
  children?: ReactNode | ((props: { field: any; error?: string }) => ReactNode);
  onFocus?: () => void;
  onBlur?: () => void;
  animate?: boolean;
}

export function FormField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({
  name,
  type = "text",
  label,
  description,
  placeholder,
  icon,
  options = [],
  min,
  max,
  step,
  rows = 4,
  cols = 50,
  accept,
  multiple = false,
  disabled = false,
  readOnly = false,
  autoFocus = false,
  required = false,
  pattern,
  autoComplete,
  className = "",
  inputClassName = "",
  labelClassName = "",
  errorClassName = "",
  descriptionClassName = "",
  children,
  onFocus,
  onBlur,
  animate = true,
}: FormFieldProps<TFieldValues, TName>) {
  const {
    control,
    formState: { errors },
  } = useFormContext<TFieldValues>();

  const error = errors[name]?.message as string | undefined;
  const fieldRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Animasyon efektleri
  useEffect(() => {
    if (animate && fieldRef.current) {
      // Input alanı için hover animasyonu
      const inputElement = fieldRef.current.querySelector("input, textarea, select");
      
      if (inputElement) {
        inputElement.addEventListener("mouseenter", () => {
          if (!isFocused) {
            gsap.to(inputElement, {
              duration: 0.3,
              boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)",
              ease: "power2.out",
            });
          }
        });
        
        inputElement.addEventListener("mouseleave", () => {
          if (!isFocused) {
            gsap.to(inputElement, {
              duration: 0.3,
              boxShadow: "none",
              ease: "power2.out",
            });
          }
        });
      }
    }
  }, [animate, isFocused]);

  // Odaklandığında efekt
  const handleFocus = () => {
    setIsFocused(true);
    if (animate && inputRef.current) {
      gsap.to(inputRef.current, {
        duration: 0.3,
        boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.2)",
        borderColor: "#6366f1",
        ease: "power2.out",
      });
    }
    if (onFocus) onFocus();
  };

  // Odaktan çıkıldığında efekt
  const handleBlur = () => {
    setIsFocused(false);
    if (animate && inputRef.current) {
      gsap.to(inputRef.current, {
        duration: 0.3,
        boxShadow: "none",
        borderColor: error ? "#ef4444" : "#d1d5db",
        ease: "power2.out",
      });
    }
    if (onBlur) onBlur();
  };

  // Hata durumunda efekt
  useEffect(() => {
    if (error && animate && inputRef.current) {
      const tl = gsap.timeline();
      tl.to(inputRef.current, {
        x: -5,
        duration: 0.1,
      })
        .to(inputRef.current, {
          x: 5,
          duration: 0.1,
        })
        .to(inputRef.current, {
          x: -3,
          duration: 0.1,
        })
        .to(inputRef.current, {
          x: 3,
          duration: 0.1,
        })
        .to(inputRef.current, {
          x: 0,
          duration: 0.1,
        });
    }
  }, [error, animate]);

  // İkon belirleme fonksiyonu
  const getIcon = () => {
    if (icon) return icon;
    
    switch (type) {
      case "email":
        return <EmailIcon />;
      case "password":
        return <PasswordIcon />;
      default:
        return null;
    }
  };

  // Input tipine göre uygun input alanını render etme
  const renderInputByType = (field: any) => {
    const commonProps = {
      id: name,
      ref: inputRef,
      className: `w-full px-4 py-3 rounded-lg border ${
        error ? "border-red-500" : "border-gray-300"
      } focus:outline-none transition-all duration-200 ${
        icon ? "pl-10" : ""
      } ${inputClassName}`,
      placeholder,
      disabled,
      readOnly,
      autoFocus,
      required,
      autoComplete,
      onFocus: handleFocus,
      onBlur: handleBlur,
      "aria-invalid": error ? "true" : "false",
      "aria-describedby": error ? `${name}-error` : undefined,
    };

    switch (type) {
      case "textarea":
        return (
          <textarea
            {...field}
            {...commonProps}
            rows={rows}
            cols={cols}
          />
        );

      case "select":
        return (
          <select
            {...field}
            {...commonProps}
          >
            <option value="" disabled>
              {placeholder || "Seçiniz..."}
            </option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case "checkbox":
        return (
          <div className="flex items-center">
            <input
              {...field}
              type="checkbox"
              id={name}
              checked={field.value}
              className={`h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded ${inputClassName}`}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
            {label && (
              <label
                htmlFor={name}
                className={`ml-2 block text-sm text-gray-700 ${labelClassName}`}
              >
                {label}
              </label>
            )}
          </div>
        );

      case "radio":
        return (
          <div className="space-y-2">
            {options.map((option) => (
              <div key={option.value} className="flex items-center">
                <input
                  {...field}
                  type="radio"
                  id={`${name}-${option.value}`}
                  value={option.value}
                  checked={field.value === option.value}
                  className={`h-4 w-4 text-primary focus:ring-primary border-gray-300 ${inputClassName}`}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                <label
                  htmlFor={`${name}-${option.value}`}
                  className={`ml-2 block text-sm text-gray-700 ${labelClassName}`}
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );

      case "toggle":
        return (
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => field.onChange(!field.value)}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                field.value ? "bg-primary" : "bg-gray-200"
              } ${inputClassName}`}
              role="switch"
              aria-checked={field.value ? "true" : "false"}
            >
              <span
                className={`${
                  field.value ? "translate-x-6" : "translate-x-1"
                } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
              />
            </button>
            {label && (
              <label
                htmlFor={name}
                className={`ml-2 block text-sm text-gray-700 ${labelClassName}`}
              >
                {label}
              </label>
            )}
          </div>
        );

      case "range":
        return (
          <input
            {...field}
            type="range"
            min={min}
            max={max}
            step={step}
            className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${inputClassName}`}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        );

      case "file":
        return (
          <input
            type="file"
            onChange={(e) => {
              const files = e.target.files;
              field.onChange(multiple ? files : files?.[0]);
            }}
            accept={accept}
            multiple={multiple}
            className={`block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 ${inputClassName}`}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        );

      default:
        return (
          <input
            {...field}
            type={type}
            {...commonProps}
            min={min}
            max={max}
            step={step}
            pattern={pattern}
          />
        );
    }
  };

  return (
    <div ref={fieldRef} className={`form-field-wrapper space-y-2 ${className}`}>
      {label && type !== "checkbox" && type !== "toggle" && (
        <label
          htmlFor={name}
          className={`block text-sm font-medium text-gray-700 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          if (typeof children === "function") {
            return children({ field, error });
          }
          
          if (children) {
            return <>{children}</>;
          }
          
          if (["text", "email", "password", "number", "tel", "url", "search", "date", "time", "datetime-local", "month", "week", "color"].includes(type)) {
            return (
              <div className="relative">
                {getIcon() && (
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {getIcon()}
                  </div>
                )}
                {renderInputByType(field)}
              </div>
            );
          }
          
          return renderInputByType(field);
        }}
      />
      
      {error && (
        <p
          id={`${name}-error`}
          className={`text-sm text-red-500 ${errorClassName}`}
          role="alert"
        >
          {error}
        </p>
      )}
      
      {description && (
        <p className={`text-sm text-gray-500 ${descriptionClassName}`}>
          {description}
        </p>
      )}
    </div>
  );
}