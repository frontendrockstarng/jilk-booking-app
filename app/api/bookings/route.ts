import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendConfirmationEmail, sendAdminNotification } from '@/lib/email';

export async function POST(req: Request) {
    try {
        const body = await req.json();

        let appointment = null;
        if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
            const { data, error } = await supabaseAdmin
                .from('appointments')
                .insert([{
                    first_name: body.firstName,
                    last_name: body.lastName,
                    email: body.email,
                    phone: body.phone,
                    property_type: body.propertyType,
                    address: body.address,
                    city: body.city,
                    state: body.state,
                    zip: body.zip,
                    bedrooms: body.bedrooms,
                    bathrooms: body.bathrooms,
                    office_size: body.officeSize,
                    floors: body.floors,
                    service_type: body.serviceType,
                    frequency: body.frequency,
                    addons: body.addons,
                    preferred_date: body.preferredDate,
                    preferred_time: body.preferredTime,
                    alternate_date: body.alternateDate,
                    access_method: body.accessMethod,
                    pets: body.pets,
                    product_preference: body.productPreference,
                    notes: body.notes,
                    status: 'pending'
                }])
                .select()
                .single();

            if (error) {
                console.error('Supabase insert error:', error);
                throw new Error('Database insert failed');
            }
            appointment = data;
        } else {
            console.warn('No Supabase credentials found. Mocking successful submission.');
            appointment = { ...body, id: 'mock-id', created_at: new Date().toISOString(), status: 'pending' };
        }

        // Send emails
        try {
            if (process.env.RESEND_API_KEY) {
                await Promise.all([
                    sendConfirmationEmail(body.email, body.firstName, body),
                    sendAdminNotification(body)
                ]);
            } else {
                console.warn('RESEND_API_KEY not set. Skipping emails.');
            }
        } catch (emailError) {
            console.error('Email sending error:', emailError);
        }

        return NextResponse.json({ success: true, data: appointment });
    } catch (error) {
        console.error('Booking error:', error);
        return NextResponse.json({ success: false, error: 'Failed to process booking' }, { status: 500 });
    }
}
