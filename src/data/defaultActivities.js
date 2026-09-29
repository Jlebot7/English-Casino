// Preloaded default English casino activities ready to play instantly in classroom projection mode

export const DEFAULT_ACTIVITIES = [
  {
    id: 'default_slots_verbs',
    pin: 'VERB77',
    title: '🎰 High Roller: Irregular Verbs Jackpot',
    description: '¡Domina los verbos irregulares! Gira los rodillos: si coinciden te salvas de la pregunta; si no, ¡respondes o dices la frase!',
    level: 'A2 - B1',
    category: 'Grammar & Verbs',
    gameType: 'slots',
    challengeType: 'random',
    createdAt: Date.now() - 86400000 * 3,
    questions: [
      {
        id: 'sv1',
        type: 'multiple_choice',
        question: "What is the past simple of the verb 'to choose'?",
        promptInstructions: "Selecciona la opción correcta en la pantalla.",
        options: ['Chose', 'Chosen', 'Choosed', 'Choosing'],
        correctAnswer: 'Chose',
        modelAnswer: 'Chose',
        explanation: "'Choose' es irregular: Choose (presente) -> Chose (pasado simple) -> Chosen (participio).",
        category: 'Grammar',
        points: 200
      },
      {
        id: 'sv2',
        type: 'sentence_affirmative',
        question: "Create an affirmative sentence in Simple Past using: [She / buy / a new laptop]",
        promptInstructions: "🗣️ Di en voz alta a la clase una oración afirmativa en pasado simple con:",
        options: [],
        correctAnswer: 'She bought a new laptop.',
        modelAnswer: 'She bought a new laptop.',
        explanation: "El pasado irregular de 'buy' es 'bought'.",
        category: 'Speaking',
        points: 250
      },
      {
        id: 'sv3',
        type: 'fill_blank',
        question: "Yesterday the river was completely _____ (freeze).",
        promptInstructions: "✏️ Completa el espacio en blanco con la forma correcta.",
        options: ['Froze', 'Frozen', 'Freezed', 'Freezing'],
        correctAnswer: 'Frozen',
        modelAnswer: 'Frozen',
        explanation: "En voz pasiva ('was _____'), se utiliza el participio pasado 'frozen'.",
        category: 'Grammar',
        points: 300
      },
      {
        id: 'sv4',
        type: 'sentence_negative',
        question: "Create a negative sentence in Past Simple using: [They / find / the secret room]",
        promptInstructions: "🗣️ Di en voz alta una oración negativa en pasado simple usando:",
        options: [],
        correctAnswer: "They didn't find the secret room.",
        modelAnswer: "They didn't find the secret room.",
        explanation: "En pasado simple negativo se usa el auxiliar 'did not' (didn't) + verbo en infinitivo 'find'.",
        category: 'Speaking',
        points: 300
      },
      {
        id: 'sv5',
        type: 'sentence_question',
        question: "Ask an interrogative question in Past Simple with: [Where / you / lose / your wallet?]",
        promptInstructions: "🗣️ Formula una pregunta en voz alta en pasado simple con:",
        options: [],
        correctAnswer: 'Where did you lose your wallet?',
        modelAnswer: 'Where did you lose your wallet?',
        explanation: "Estructura interrogativa WH: Wh-word + did + sujeto + verbo base (Where did you lose...).",
        category: 'Speaking',
        points: 350
      },
      {
        id: 'sv6',
        type: 'fill_blank',
        question: "Complete: 'The school bell has already _____ (ring).'",
        promptInstructions: "✏️ Completa con el participio adecuado.",
        options: ['Rung', 'Rang', 'Ringed', 'Rong'],
        correctAnswer: 'Rung',
        modelAnswer: 'Rung',
        explanation: "Ring -> Rang -> Rung. Con 'has' (presente perfecto) se usa 'rung'.",
        category: 'Grammar',
        points: 250
      }
    ]
  },
  {
    id: 'default_roulette_travel',
    pin: 'SPIN24',
    title: '🎡 Vegas Airport & Travel Roulette',
    description: '¡Desafía la ruleta de viajes! Predice el color: si aciertas quedas exonerado; si no, respondes o formulas una frase de viaje.',
    level: 'B1 - B2',
    category: 'Travel & Communication',
    gameType: 'roulette',
    challengeType: 'random',
    createdAt: Date.now() - 86400000 * 2,
    questions: [
      {
        id: 'rt1',
        type: 'multiple_choice',
        question: "At the airport counter, what does 'boarding pass' mean?",
        promptInstructions: "Elige el significado correcto.",
        options: [
          'Document granting access to enter the airplane',
          'A ticket to park your rental car',
          'A passport renewal application',
          'Hotel reservation receipt'
        ],
        correctAnswer: 'Document granting access to enter the airplane',
        modelAnswer: 'Document granting access to enter the airplane',
        explanation: "A 'boarding pass' is the official document allowing a passenger to board an aircraft.",
        category: 'Vocabulary',
        points: 200
      },
      {
        id: 'rt2',
        type: 'sentence_question',
        question: "Create a polite question asking for directions: [Excuse me / where / can I find / Gate 12?]",
        promptInstructions: "🗣️ Pregunta amablemente en voz alta dónde queda la Puerta 12:",
        options: [],
        correctAnswer: 'Excuse me, where can I find Gate 12?',
        modelAnswer: 'Excuse me, where can I find Gate 12?',
        explanation: "Usa 'Excuse me' para iniciar cortésmente preguntas en situaciones de servicio y viaje.",
        category: 'Speaking',
        points: 300
      },
      {
        id: 'rt3',
        type: 'sentence_negative',
        question: "Create a negative sentence in Present Perfect: [My luggage / arrive / yet]",
        promptInstructions: "🗣️ Di en voz alta que tu equipaje aún no ha llegado:",
        options: [],
        correctAnswer: "My luggage hasn't arrived yet.",
        modelAnswer: "My luggage hasn't arrived yet.",
        explanation: "'Luggage' es incontable (singular). Usamos 'hasn't arrived' + 'yet' al final.",
        category: 'Grammar',
        points: 300
      },
      {
        id: 'rt4',
        type: 'multiple_choice',
        question: "Which phrasal verb means the plane is leaving the ground into the air?",
        promptInstructions: "Selecciona el phrasal verb adecuado.",
        options: ['Take off', 'Drop off', 'Check in', 'Touch down'],
        correctAnswer: 'Take off',
        modelAnswer: 'Take off',
        explanation: "'To take off' is when an airplane becomes airborne.",
        category: 'Phrasal Verbs',
        points: 250
      },
      {
        id: 'rt5',
        type: 'sentence_affirmative',
        question: "Create an affirmative sentence using 'would like': [I / book / a window seat]",
        promptInstructions: "🗣️ Di en voz alta que te gustaría reservar un asiento junto a la ventana:",
        options: [],
        correctAnswer: "I would like to book a window seat.",
        modelAnswer: "I would like to book a window seat.",
        explanation: "'Would like to' se usa para peticiones y solicitudes corteses en hoteles y aerolíneas.",
        category: 'Speaking',
        points: 250
      },
      {
        id: 'rt6',
        type: 'fill_blank',
        question: "You must show your passport at the immigration _____ (desk / counter / checkpoint).",
        promptInstructions: "✏️ Elige el término más natural.",
        options: ['Checkpoint', 'Kitchen', 'Elevator', 'Cinema'],
        correctAnswer: 'Checkpoint',
        modelAnswer: 'Checkpoint',
        explanation: "Immigration checkpoints or counters are where official passport control takes place.",
        category: 'Vocabulary',
        points: 200
      }
    ]
  },
  {
    id: 'default_blackjack_daily',
    pin: 'JACK21',
    title: '🃏 21 Blackjack: Daily Routines & Present Tenses',
    description: '¡Derrota al crupier para exonerarte! Si ganas la mano te salvas del reto; si pierdes, ¡a practicar rutinas en inglés!',
    level: 'A1 - A2',
    category: 'Daily Routines',
    gameType: 'blackjack',
    challengeType: 'random',
    createdAt: Date.now() - 86400000,
    questions: [
      {
        id: 'bj1',
        type: 'multiple_choice',
        question: "He usually _____ (wake up) at 6:30 AM every morning.",
        promptInstructions: "Selecciona la forma correcta para la tercera persona singular.",
        options: ['Wakes up', 'Wake up', 'Waking up', 'Woke up'],
        correctAnswer: 'Wakes up',
        modelAnswer: 'Wakes up',
        explanation: "En presente simple con he/she/it, el verbo agrega -s o -es ('wakes up').",
        category: 'Grammar',
        points: 200
      },
      {
        id: 'bj2',
        type: 'sentence_negative',
        question: "Create a negative sentence in Present Simple: [Daniel / not / drink / coffee in the evening]",
        promptInstructions: "🗣️ Di en voz alta una frase negativa con Daniel y el café:",
        options: [],
        correctAnswer: "Daniel doesn't drink coffee in the evening.",
        modelAnswer: "Daniel doesn't drink coffee in the evening.",
        explanation: "Con tercera persona 'Daniel', la negación en presente simple es 'doesn't' + verbo base.",
        category: 'Speaking',
        points: 250
      },
      {
        id: 'bj3',
        type: 'sentence_question',
        question: "Create a question in Present Simple: [Do / you / brush / your teeth before bed?]",
        promptInstructions: "🗣️ Haz una pregunta a la clase sobre cepillarse los dientes:",
        options: [],
        correctAnswer: 'Do you brush your teeth before bed?',
        modelAnswer: 'Do you brush your teeth before bed?',
        explanation: "Pregunta con 'you' en presente simple: Do + sujeto + verbo base.",
        category: 'Speaking',
        points: 250
      },
      {
        id: 'bj4',
        type: 'sentence_affirmative',
        question: "Create an affirmative sentence in Present Continuous: [The students / practice / English right now]",
        promptInstructions: "🗣️ Di en voz alta una oración afirmativa en presente continuo con:",
        options: [],
        correctAnswer: 'The students are practicing English right now.',
        modelAnswer: 'The students are practicing English right now.',
        explanation: "Presente continuo: sujeto plural (students) + are + verbo con -ing (practicing).",
        category: 'Grammar',
        points: 300
      },
      {
        id: 'bj5',
        type: 'fill_blank',
        question: "My brother never _____ (do) his homework on Sunday nights.",
        promptInstructions: "✏️ Elige la conjugación correcta de 'do'.",
        options: ['Does', 'Do', 'Doing', 'Done'],
        correctAnswer: 'Does',
        modelAnswer: 'Does',
        explanation: "Tercera persona singular de 'do' es 'does'.",
        category: 'Grammar',
        points: 200
      }
    ]
  }
];
