// ============================================================
// SafeRoute AI — GET /api/alerts  |  POST /api/alerts
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ApiResponse, DbAlert } from '@/types';

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(30);

  if (error) {
    return NextResponse.json({ success: false, error: error.message, data: null }, { status: 500 });
  }
  return NextResponse.json({ success: true, error: null, data });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const body     = await req.json();

  // Only service-role or admin can create system alerts
  // For now accept from authenticated users
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized', data: null }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('alerts')
    .insert({
      type:           body.type,
      severity:       body.severity,
      title:          body.title,
      description:    body.description,
      affected_roads: body.affected_roads ?? [],
      lat:            body.lat ?? null,
      lng:            body.lng ?? null,
      location_name:  body.location_name,
      source:         body.source ?? 'crowdsourced',
      active:         true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message, data: null }, { status: 500 });
  }
  return NextResponse.json({ success: true, error: null, data }, { status: 201 });
}
