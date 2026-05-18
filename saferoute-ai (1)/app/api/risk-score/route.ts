// ============================================================
// SafeRoute AI — POST /api/risk-score
// Computes risk score from weather + active reports
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { computeRiskScore } from '@/lib/risk-engine';
import { generateSystemAlerts, predictFloodProbability } from '@/lib/disaster-detection';
import type { ApiResponse } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { lat = -1.2921, lng = 36.8219 } = await req.json();

    // Fetch weather
    const wRes    = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/weather?lat=${lat}&lng=${lng}`
    );
    const wJson   = await wRes.json();
    const weather = wJson.data;

    if (!weather) throw new Error('Could not fetch weather data');

    // Count active high-severity reports
    const supabase = await createClient();
    const { data: reports } = await supabase
      .from('disaster_reports')
      .select('id, severity')
      .in('severity', ['high', 'critical']);

    const activeBlocks = reports?.length ?? 0;
    const riskScore    = computeRiskScore(weather, activeBlocks);
    const floodPred    = predictFloodProbability(weather);

    return NextResponse.json({
      success: true,
      error: null,
      data: { risk_score: riskScore, flood_prediction: floodPred, weather },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Failed', data: null },
      { status: 500 }
    );
  }
}
