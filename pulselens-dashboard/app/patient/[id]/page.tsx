'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Patient, fetchPatientFromApi } from '@/lib/patients-data';
import { apiPath } from '@/lib/api';
import { ArrowLeft, AlertTriangle, Brain, Pill, Activity } from 'lucide-react';

interface AiDiagnosis {
  primary_diagnosis: string;
  recommendations: string[];
  urgency: string;
  confidence: number;
  reasoning?: string;
  aiDisclaimer?: string;
  warnings?: string[];
}

export default function PatientDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [patient, setPatient] = useState<Patient | null>(null);
  const [aiDiagnosis, setAiDiagnosis] = useState<AiDiagnosis | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [showAi, setShowAi] = useState(false);

  useEffect(() => {
    fetchPatientFromApi(id).then(setPatient);
  }, [id]);

  const requestAiDiagnosis = async () => {
    if (!patient) return;
    setLoadingAi(true);
    setShowAi(true);
    const base = apiPath('/clinical');

    const showError = (message: string, recommendations: string[] = []) => {
      setAiDiagnosis({
        primary_diagnosis: message,
        recommendations: recommendations.length ? recommendations : ['Check backend connection'],
        urgency: 'routine',
        confidence: 0,
        aiDisclaimer: 'AI-generated suggestion — not verified clinical fact.',
      });
    };

    try {
      const sessionRes = await fetch(`${base}/session`, { method: 'POST' });
      const session = await sessionRes.json();
      if (!sessionRes.ok || !session.success) {
        showError(session.error || 'Failed to create clinical session');
        return;
      }

      const res = await fetch(`${base}/decision-support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.session_id,
          patient_id: patient.id,
          symptoms: patient.current_symptoms,
          vital_signs: patient.vital_signs,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showError(data.error || 'AI assessment request failed');
        return;
      }
      setAiDiagnosis(data);
    } catch {
      showError('Unable to reach AI service');
    } finally {
      setLoadingAi(false);
    }
  };

  if (!patient) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-yellow-50">
        <p className="text-stone-500">Loading patient...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-amber-100">
      <header className="border-b border-amber-200/50 bg-white/30 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="text-stone-600 hover:text-stone-800">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-stone-800">{patient.name}</h1>
            <p className="text-sm text-stone-500">
              {patient.id} · {patient.age}y {patient.sex}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
        <div className="glass-card p-6">
          <h2 className="flex items-center gap-2 font-semibold text-stone-800">
            <Activity className="h-5 w-5 text-amber-600" /> Chief Complaint
          </h2>
          <p className="mt-2 text-stone-700">{patient.chief_complaint}</p>
          <p className="mt-1 text-sm text-stone-500">
            Symptoms: {patient.current_symptoms.join(', ')}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="glass-card p-6">
            <h2 className="font-semibold text-stone-800">Vitals</h2>
            <ul className="mt-3 space-y-1 text-sm text-stone-700">
              <li>BP: {patient.vital_signs.bloodPressure}</li>
              <li>HR: {patient.vital_signs.heartRate} bpm</li>
              {patient.vital_signs.o2Saturation && (
                <li>SpO₂: {patient.vital_signs.o2Saturation}%</li>
              )}
              {patient.vital_signs.temperature && (
                <li>Temp: {patient.vital_signs.temperature}°F</li>
              )}
            </ul>
          </div>

          <div className="glass-card p-6">
            <h2 className="flex items-center gap-2 font-semibold text-red-700">
              <AlertTriangle className="h-4 w-4" /> Allergies
            </h2>
            <ul className="mt-3 space-y-1 text-sm">
              {patient.allergies.length
                ? patient.allergies.map((a) => (
                    <li key={a} className="font-medium text-red-600">{a}</li>
                  ))
                : <li className="text-stone-500">None recorded</li>}
            </ul>
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="flex items-center gap-2 font-semibold text-stone-800">
            <Pill className="h-5 w-5 text-amber-600" /> Medications
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-stone-700">
            {patient.medications.length
              ? patient.medications.map((m) => (
                  <li key={m.name}>{m.name} — {m.dosage}</li>
                ))
              : <li className="text-stone-500">None</li>}
          </ul>
        </div>

        <div className="glass-card p-6">
          <h2 className="font-semibold text-stone-800">Diagnosis History</h2>
          <ul className="mt-3 list-disc pl-5 text-sm text-stone-700">
            {patient.diagnosis_history.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>

        <div className="glass-card border-amber-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold text-stone-800">
              <Brain className="h-5 w-5 text-violet-600" /> AI Clinical Support
            </h2>
            <button
              type="button"
              onClick={requestAiDiagnosis}
              disabled={loadingAi}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {loadingAi ? 'Analyzing...' : showAi ? 'Refresh' : 'Get AI Assessment'}
            </button>
          </div>

          {showAi && aiDiagnosis && (
            <div className="mt-4 space-y-3 rounded-lg bg-violet-50/50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-violet-600">
                AI Suggestion — Not Verified Clinical Fact
              </p>
              <p className="font-medium text-stone-800">{aiDiagnosis.primary_diagnosis}</p>
              <p className="text-sm text-stone-600">
                Urgency: <span className="font-medium">{aiDiagnosis.urgency}</span>
                {' · '}Confidence: {(aiDiagnosis.confidence * 100).toFixed(0)}%
              </p>
              {aiDiagnosis.recommendations?.map((r, i) => (
                <p key={i} className="text-sm text-stone-700">• {r}</p>
              ))}
              {aiDiagnosis.reasoning && (
                <p className="text-sm italic text-stone-500">{aiDiagnosis.reasoning}</p>
              )}
              <p className="text-xs text-stone-400">
                {aiDiagnosis.aiDisclaimer ||
                  'AI-generated suggestion — confirm with a licensed clinician.'}
              </p>
            </div>
          )}
        </div>

        {patient.isSynthetic && (
          <p className="text-center text-xs text-amber-600">
            This is a synthetic patient record for search UX demonstration.
          </p>
        )}
      </main>
    </div>
  );
}
