// ============================================================
// SafeRoute AI — GET /api/disaster-reports | POST
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const supabase   = await createClient();
  const { searchParams } = new URL(req.url);
  const type     = searchParams.get('type');
  const severity = searchParams.get('severity');

  let query = supabase
    .from('disaster_reports')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (type)     query = query.eq('type', type);
  if (severity) query = query.eq('severity', severity);

  const { data, error } = await query;
  if (error) return NextResponse.json({ success: false, error: error.message, data: null }, { status: 500 });
  return NextResponse.json({ success: true, error: null, data });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized', data: null }, { status: 401 });
  }

  const body = await req.json();

  const { data, error } = await supabase
    .from('disaster_reports')
    .insert({
      user_id:       user.id,
      type:          body.type,
      severity:      body.severity ?? 'medium',
      title:         body.title ?? `${body.type} reported`,
      description:   body.description,
      lat:           body.lat,
      lng:           body.lng,
      location_name: body.location_name,
      verified:      false,
      upvotes:       0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ success: false, error: error.message, data: null }, { status: 500 });
  return NextResponse.json({ success: true, error: null, data }, { status: 201 });
}
