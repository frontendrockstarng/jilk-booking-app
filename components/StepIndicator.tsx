"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
    currentStep: number;
    totalSteps: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
    return (
        <div className="flex items-center justify-between w-full relative mb-8 px-2 max-w-2xl mx-auto">
            {/* Background Line */}
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-200 rounded-full z-0" />

            {/* Animated Progress Line */}
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 z-0">
                <motion.div
                    className="h-full bg-primary rounded-full origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: (currentStep - 1) / (totalSteps - 1) }}
                    transition={{ duration: 0.3 }}
                />
            </div>

            {Array.from({ length: totalSteps }).map((_, index) => {
                const step = index + 1;
                const isCompleted = step < currentStep;
                const isCurrent = step === currentStep;

                return (
                    <div key={step} className="relative z-10 flex flex-col items-center">
                        <motion.div
                            animate={{
                                backgroundColor: isCompleted || isCurrent ? '#2563EB' : '#FFFFFF',
                                borderColor: isCompleted || isCurrent ? '#2563EB' : '#CBD5E1',
                                color: isCompleted || isCurrent ? '#FFFFFF' : '#64748B'
                            }}
                            className={`w-10 h-10 rounded-full border-2 bg-white flex items-center justify-center font-bold font-sans text-sm transition-shadow ${isCurrent ? 'shadow-[0_0_0_4px_rgba(37,99,235,0.2)]' : ''}`}
                        >
                            {isCompleted ? <Check className="w-5 h-5 text-white" /> : step}
                        </motion.div>
                    </div>
                );
            })}
        </div>
    );
};
