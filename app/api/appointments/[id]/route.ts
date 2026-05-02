import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        let body;
        try {
            const text = await req.text();
            body = JSON.parse(text);
        } catch (parseError) {
            console.error('Body parse error:', parseError);
            return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
        }

        console.log(`Updating appointment ${id}:`, Object.keys(body));

        const { data, error } = await supabaseAdmin
            .from('appointments')
            .update(body)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Supabase update error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        console.log('Update successful:', data?.id);
        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Update error:', error);
        return NextResponse.json({ success: false, error: 'Failed to update' }, { status: 500 });
    }
}
