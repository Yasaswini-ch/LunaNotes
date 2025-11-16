const DEMO_NOTES = [
  {
    noteId: 'demo-astro-luna',
    createdAt: '2024-10-12T10:00:00.000Z',
    summary: 'Phases of the Moon explain how sunlight reflects off the lunar surface as it orbits Earth.',
    data: {
      summary:
        'The Moon’s phases are driven by orbital geometry: new moon aligns with the Sun, while full moon occurs opposite Earth with maximal illumination.',
      keypoints: [
        '1. Orbital period is ~29.5 days (synodic month).',
        '2. Waxing phases increase visible illumination; waning phases reduce it.',
        '3. Lunar eclipses require perfect Sun-Earth-Moon alignment during full moon.',
        '4. Tidal locking keeps the same lunar hemisphere facing Earth.',
        '5. Crescent, quarter, gibbous describe illuminated fraction.',
      ],
      definitions: [
        { term: 'Synodic Month', definition: 'Time for the Moon to reach the same phase (≈29.5 days).' },
        { term: 'Waxing', definition: 'The illuminated portion visible from Earth is increasing.' },
        { term: 'Waning', definition: 'The illuminated portion visible from Earth is decreasing.' },
        { term: 'Tidal Locking', definition: 'Rotation period matches orbital period, so one face points toward Earth.' },
      ],
      formulas: [{ formula: 'Illumination ≈ (1 + cos θ) / 2', result: 'θ is the Sun-Earth-Moon angle.' }],
    },
  },
  {
    noteId: 'demo-bio-neuro',
    createdAt: '2024-09-02T08:30:00.000Z',
    summary: 'Neurons transmit electrical and chemical signals enabling reflexes, memory, and emotion.',
    data: {
      summary:
        'The neuron is the functional unit of the nervous system, integrating dendritic input and propagating action potentials along axons.',
      keypoints: [
        '1. Dendrites collect graded potentials from upstream cells.',
        '2. Axon hillock sums inputs before triggering an action potential.',
        '3. Myelin sheaths accelerate conduction through saltatory propagation.',
        '4. Neurotransmitters cross synaptic clefts to bind receptors.',
        '5. Plasticity alters synaptic strength during learning.',
      ],
      definitions: [
        { term: 'Action Potential', definition: 'All-or-none depolarization that travels down the axon.' },
        { term: 'Synapse', definition: 'Junction where neurons communicate via neurotransmitters.' },
        { term: 'Myelin', definition: 'Insulating lipid layer produced by glial cells.' },
      ],
      formulas: [{ formula: 'V_m = 61.5 log10 ( [K+]_out / [K+]_in )', result: 'Nernst potential for potassium at 37°C.' }],
    },
  },
  {
    noteId: 'demo-chem-climate',
    createdAt: '2024-08-18T14:45:00.000Z',
    summary: 'Greenhouse gases trap infrared radiation, elevating global mean temperature.',
    data: {
      summary:
        'CO₂, methane, and nitrous oxide absorb outgoing IR radiation; radiative forcing scales with gas concentration and feedback loops.',
      keypoints: [
        '1. CO₂ concentration passed 420 ppm in 2024.',
        '2. Methane has ~28x higher GWP over 100 years compared to CO₂.',
        '3. Positive feedbacks include water vapor and ice-albedo changes.',
        '4. Aerosols provide short-term cooling by scattering sunlight.',
        '5. Mitigation needs both emission cuts and carbon sequestration.',
      ],
      definitions: [
        { term: 'Radiative Forcing', definition: 'Change in net irradiance (W/m²) at the tropopause due to perturbations.' },
        { term: 'GWP', definition: 'Global Warming Potential, comparing heat trapping to CO₂.' },
      ],
      formulas: [{ formula: 'ΔF = 5.35 · ln(C/C₀)', result: 'CO₂ radiative forcing (W/m²) from concentration change.' }],
    },
  },
];

const cloneDemoNote = (note) => ({
  ...note,
  data: {
    ...note.data,
    keypoints: [...(note.data.keypoints || [])],
    definitions: (note.data.definitions || []).map((def) => ({ ...def })),
    formulas: (note.data.formulas || []).map((formula) => ({ ...formula })),
  },
});

export const getDemoNotes = () => DEMO_NOTES.map(cloneDemoNote);

export default DEMO_NOTES;
