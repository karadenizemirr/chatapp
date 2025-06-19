"use client";

import React, { ReactNode, useRef, useEffect } from "react";
import {
  UseFormReturn,
  FieldValues,
  SubmitHandler,
  useForm,
  FormProvider,
} from "react-hook-form";
import { ZodType, ZodTypeDef } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { gsap } from "gsap";

interface FormProps<
  TFormValues extends FieldValues,
  Schema extends ZodType<unknown, ZodTypeDef, unknown>
> {
  children: ReactNode;
  onSubmit: SubmitHandler<TFormValues>;
  schema?: Schema;
  form?: UseFormReturn<TFormValues>;
  className?: string;
  defaultValues?: Partial<TFormValues>;
  animate?: boolean;
  animationDelay?: number;
}

export function Form<
  TFormValues extends FieldValues,
  Schema extends ZodType<unknown, ZodTypeDef, unknown>
>({
  children,
  onSubmit,
  schema,
  form,
  className = "",
  defaultValues,
  animate = true,
  animationDelay = 0,
}: FormProps<TFormValues, Schema>) {
  const methods =
    form ||
    useForm<TFormValues>({
      resolver: schema ? zodResolver(schema) : undefined,
      defaultValues,
    });

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (animate && formRef.current) {
      // Form için başlangıç animasyon durumu
      gsap.set(formRef.current, {
        opacity: 0,
        y: 20,
      });

      // Form animasyonu
      gsap.to(formRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        delay: animationDelay,
        ease: "power2.out",
      });

      // Form alanları için animasyon
      const formElements = formRef.current.querySelectorAll(
        ".form-field-wrapper"
      );
      if (formElements.length > 0) {
        gsap.set(formElements, { opacity: 0, y: 15 });
        gsap.to(formElements, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          delay: animationDelay + 0.2,
          ease: "power2.out",
        });
      }
    }
  }, [animate, animationDelay]);

  // Form gönderildiğinde animasyon
  const handleAnimatedSubmit = async (data: TFormValues) => {
    // Form gönderim efekti
    if (animate && formRef.current) {
      const submitButton = formRef.current.querySelector(
        'button[type="submit"]'
      );
      if (submitButton) {
        gsap.to(submitButton, {
          scale: 0.95,
          duration: 0.1,
          yoyo: true,
          repeat: 1,
          ease: "power1.inOut",
        });
      }
    }

    // Form gönderimini gerçekleştir
    await onSubmit(data);
  };

  return (
    <FormProvider {...methods}>
      <form
        ref={formRef}
        onSubmit={methods.handleSubmit(handleAnimatedSubmit)}
        className={`transition-all duration-300 text-sm ${className}`}
        noValidate
      >
        {children}
      </form>
    </FormProvider>
  );
}
