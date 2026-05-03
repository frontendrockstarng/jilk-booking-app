"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select } from './ui/select';
import { StepIndicator } from './StepIndicator';

const bookingSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),

    propertyType: z.enum(['residential', 'commercial']),
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zip: z.string().min(1, "ZIP code is required"),

    bedrooms: z.string().optional(),
    bathrooms: z.string().optional(),
    officeSize: z.string().optional(),
    floors: z.string().optional(),

    serviceType: z.string().min(1, "Service type is required"),
    frequency: z.string().min(1, "Frequency is required"),
    addons: z.array(z.string()).default([]),

    preferredDate: z.string().min(1, "Preferred date is required"),
    preferredTime: z.string().min(1, "Preferred time is required"),
    alternateDate: z.string().optional(),
    accessMethod: z.string().optional(),
    pets: z.string().optional(),
    productPreference: z.string().optional(),
    notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export const BookingForm = () => {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        trigger,
        watch,
        setValue,
        formState: { errors }
    } = useForm<BookingFormData>({
        resolver: zodResolver(bookingSchema) as any,
        defaultValues: {
            propertyType: 'residential',
            addons: [],
            preferredDate: new Date().toISOString().split('T')[0],
            preferredTime: 'Morning',
        }
    });

    const preferredDate = watch('preferredDate');
    const preferredTime = watch('preferredTime');
    const today = new Date().toISOString().split('T')[0];

    const getTimeOptions = () => {
        const options = [
            { label: "Morning (8:00 AM - 12:00 PM)", value: "Morning" },
            { label: "Afternoon (1:00 PM - 5:00 PM)", value: "Afternoon" }
        ];

        if (preferredDate === today) {
            const currentHour = new Date().getHours();
            return options.filter(opt => {
                if (opt.value === 'Morning') return currentHour < 8;
                if (opt.value === 'Afternoon') return currentHour < 13;
                return true;
            });
        }
        return options;
    };

    const timeOptions = getTimeOptions();

    const propertyType = watch('propertyType');
    const serviceType = watch('serviceType');
    const frequency = watch('frequency');
    const addons = watch('addons');

    const handleNext = async () => {
        let fieldsToValidate: any[] = [];
        if (step === 1) fieldsToValidate = ['firstName', 'lastName', 'email', 'phone'];
        if (step === 2) fieldsToValidate = ['propertyType', 'address', 'city', 'state', 'zip',
            propertyType === 'residential' ? 'bedrooms' : 'officeSize',
            propertyType === 'residential' ? 'bathrooms' : 'floors'];
        if (step === 3) fieldsToValidate = ['serviceType', 'frequency'];

        const isValid = await trigger(fieldsToValidate as any);
        if (isValid) {
            setStep((p) => p + 1);
        }
    };

    const handleBack = () => setStep((p) => p - 1);

    const onSubmit = async (data: BookingFormData) => {
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (res.ok) {
                setIsSuccess(true);
            } else {
                alert("Something went wrong");
            }
        } catch (error) {
            alert("Failed to submit");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <Card className="p-8 text-center bg-white shadow-xl max-w-xl mx-auto">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Booking Confirmed!</h2>
                <p className="text-slate-600 mb-8">Thank you for choosing JILK Integrated Services. We've sent a confirmation to your email.</p>
                <Button onClick={() => window.location.reload()}>Book Another</Button>
            </Card>
        );
    }

    const slideVariants = {
        hidden: { x: 50, opacity: 0 },
        visible: { x: 0, opacity: 1, transition: { duration: 0.3 } },
        exit: { x: -50, opacity: 0, transition: { duration: 0.3 } }
    };

    return (
        <div className="max-w-2xl mx-auto pb-10">
            <StepIndicator currentStep={step} totalSteps={4} />

            <Card className="p-6 md:p-8 overflow-hidden bg-white/80 backdrop-blur-md">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="step1" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                                <h2 className="text-2xl font-bold text-slate-900">Contact Details</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                                        <Input {...register('firstName')} placeholder="Jane" />
                                        {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                                        <Input {...register('lastName')} placeholder="Doe" />
                                        {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                        <Input {...register('email')} type="email" placeholder="jane@example.com" />
                                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                                        <Input {...register('phone')} type="tel" placeholder="(555) 123-4567" />
                                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="step2" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                                <h2 className="text-2xl font-bold text-slate-900">Property Details</h2>

                                <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
                                    <button type="button" onClick={() => setValue('propertyType', 'residential')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${propertyType === 'residential' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Residential</button>
                                    <button type="button" onClick={() => setValue('propertyType', 'commercial')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${propertyType === 'commercial' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Commercial</button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                                        <Input {...register('address')} placeholder="123 Main St" />
                                        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="col-span-1">
                                            <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                                            <Input {...register('city')} />
                                            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                                            <Input {...register('state')} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">ZIP</label>
                                            <Input {...register('zip')} />
                                        </div>
                                    </div>

                                    {propertyType === 'residential' ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Bedrooms</label>
                                                <Select {...register('bedrooms')} options={[{ label: "1", value: "1" }, { label: "2", value: "2" }, { label: "3+", value: "3+" }]} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Bathrooms</label>
                                                <Select {...register('bathrooms')} options={[{ label: "1", value: "1" }, { label: "2", value: "2" }, { label: "3+", value: "3+" }]} />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Office Size (sqft)</label>
                                                <Input {...register('officeSize')} placeholder="e.g. 2000" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Number of Floors</label>
                                                <Input {...register('floors')} placeholder="e.g. 2" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div key="step3" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                                <h2 className="text-2xl font-bold text-slate-900">Service Selection</h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Service Type</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {['Standard Clean', 'Deep Clean', 'Move In/Out', 'Post-Construction'].map((type) => (
                                                <div
                                                    key={type}
                                                    onClick={() => setValue('serviceType', type)}
                                                    className={`p-4 border rounded-xl cursor-pointer transition-all ${serviceType === type ? 'border-primary bg-blue-50 ring-1 ring-primary' : 'border-slate-200 hover:border-blue-300'}`}
                                                >
                                                    <p className={`font-medium ${serviceType === type ? 'text-primary' : 'text-slate-700'}`}>{type}</p>
                                                </div>
                                            ))}
                                        </div>
                                        {errors.serviceType && <p className="text-red-500 text-xs mt-1">{errors.serviceType.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Frequency</label>
                                        <div className="flex flex-wrap gap-2">
                                            {['One-time', 'Weekly', 'Bi-weekly', 'Monthly'].map((freq) => (
                                                <span
                                                    key={freq}
                                                    onClick={() => setValue('frequency', freq)}
                                                    className={`px-4 py-2 rounded-full cursor-pointer text-sm font-medium transition-all ${frequency === freq ? 'bg-primary text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                                >
                                                    {freq}
                                                </span>
                                            ))}
                                        </div>
                                        {errors.frequency && <p className="text-red-500 text-xs mt-1">{errors.frequency.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Add-ons</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {['Inside Fridge', 'Inside Oven', 'Interior Windows', 'Laundry Wash & Dry'].map((addon) => {
                                                const isSelected = addons.includes(addon);
                                                return (
                                                    <label key={addon} className={`flex items-center space-x-3 p-3 border rounded-xl cursor-pointer ${isSelected ? 'border-primary bg-blue-50' : 'border-slate-200'}`}>
                                                        <input
                                                            type="checkbox"
                                                            value={addon}
                                                            className="w-4 h-4 text-primary rounded border-slate-300"
                                                            {...register('addons')}
                                                        />
                                                        <span className="text-sm font-medium text-slate-700">{addon}</span>
                                                    </label>
                                                )
                                            })}
                                        </div>
                                    </div>

                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div key="step4" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                                <h2 className="text-2xl font-bold text-slate-900">Schedule & Access</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Date</label>
                                        <Input {...register('preferredDate')} type="date" min={today} />
                                        {errors.preferredDate && <p className="text-red-500 text-xs mt-1">{errors.preferredDate.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Time</label>
                                        <Select {...register('preferredTime')} options={timeOptions} />
                                        {errors.preferredTime && <p className="text-red-500 text-xs mt-1">{errors.preferredTime.message}</p>}
                                        {preferredDate === today && timeOptions.length === 0 && (
                                            <p className="text-amber-600 text-xs mt-1">No slots left today. Please pick another date.</p>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Property Access</label>
                                        <Select {...register('accessMethod')} options={[
                                            { label: "Someone will be home", value: "home" },
                                            { label: "Hidden key / Lockbox", value: "lockbox" },
                                            { label: "Building concierge", value: "concierge" }
                                        ]} />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Any Pets?</label>
                                        <Input {...register('pets')} placeholder="e.g. 1 dog, 2 cats" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Cleaning Products</label>
                                        <Select {...register('productPreference')} options={[
                                            { label: "Bring your own", value: "provider" },
                                            { label: "Use my supplies", value: "customer" }
                                        ]} />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Additional Notes</label>
                                        <textarea
                                            {...register('notes')}
                                            className="flex w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-h-[100px]"
                                            placeholder="Special instructions..."
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
                        {step > 1 ? (
                            <Button type="button" variant="outline" onClick={handleBack}>
                                Back
                            </Button>
                        ) : <div />}

                        {step < 4 ? (
                            <Button type="button" onClick={handleNext}>
                                Next Step
                            </Button>
                        ) : (
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
                            </Button>
                        )}
                    </div>
                </form>
            </Card>
        </div>
    );
};
