# Clinical Mode

## States

`IDLE → LOADING_PATIENT → PATIENT_LOADED → RECORDING_SYMPTOM | PRESCRIBING | REQUESTING_DECISION → EXIT`

## Timings

- Patient load retries: 3
- Inactivity timeout: 120000 ms
- Patient card display: 10 s

## Voice intents

`start_assessment`, `record_symptom`, `prescribe_medication`, `show_medications`, `show_allergies`, `show_patient_history`, `request_decision`, `end_session`

## API

Load, symptom, decision-support, prescription, patients list, session create.
