// Preloaded default English casino activities ready to play instantly
// Balanced with 3 pedagogical pillars: Concept (open), Example (production), and Multiple Choice

export const DEFAULT_ACTIVITIES = [
  {
    id: 'default_slots_verbs',
    pin: 'VERB77',
    title: '🎰 High Roller: Irregular Verbs Jackpot',
    description: 'Master past simple and past participle forms! Spin the reels and hit the jackpot with verb masteries.',
    level: 'A2 - B1',
    category: 'Grammar & Verbs',
    gameType: 'slots',
    createdAt: Date.now() - 86400000 * 3,
    questions: [
      {
        id: 'sv1',
        type: 'multiple_choice',
        question: "What is the past simple of the verb 'to choose'?",
        options: ['Chose', 'Chosen', 'Choosed', 'Choosing'],
        correctAnswer: 'Chose',
        promptInstructions: 'Selecciona la opción correcta.',
        explanation: "'Choose' is an irregular verb: Choose (present) -> Chose (past simple) -> Chosen (past participle).",
        category: 'Grammar',
        points: 200
      },
      {
        id: 'sv2',
        type: 'concept',
        question: "Explain in your own words the difference between a 'regular verb' and an 'irregular verb' in English.",
        options: [],
        correctAnswer: 'Regular verbs add -ed in the past, while irregular verbs change root spelling or remain unchanged.',
        modelAnswer: 'Regular verbs form the past simple and participle by adding -ed (e.g. walk -> walked), whereas irregular verbs change spelling irregularly (e.g. go -> went -> gone) or stay the same (e.g. cut -> cut).',
        promptInstructions: 'Explica la diferencia entre verbos regulares e irregulares en voz alta al docente.',
        explanation: 'En inglés, los regulares siguen el patrón -ed, mientras los irregulares tienen formas históricas únicas.',
        category: 'Grammar',
        points: 250
      },
      {
        id: 'sv3',
        type: 'example',
        question: "Create an affirmative sentence using the past participle of 'fly' ('flown') in the present perfect tense ('have/has flown').",
        options: [],
        correctAnswer: 'I have flown across the Atlantic Ocean twice.',
        modelAnswer: 'She has flown to London three times this year.',
        promptInstructions: 'Di o escribe una oración de ejemplo en Present Perfect usando "flown".',
        explanation: 'El participio de fly es flown y se combina con have/has para tiempos perfectos.',
        category: 'Grammar',
        points: 300
      },
      {
        id: 'sv4',
        type: 'multiple_choice',
        question: "Complete the sentence: 'The school bell has already _____.'",
        options: ['Rung', 'Rang', 'Ringed', 'Rong'],
        correctAnswer: 'Rung',
        promptInstructions: 'Selecciona la opción correcta.',
        explanation: "Ring -> Rang -> Rung. With present perfect ('has'), use the past participle 'rung'.",
        category: 'Grammar',
        points: 350
      },
      {
        id: 'sv5',
        type: 'concept',
        question: "When do we use the Past Participle instead of the Past Simple in English grammar?",
        options: [],
        correctAnswer: 'Past participle is used with auxiliary verbs for perfect tenses (have/has/had) and passive voice.',
        modelAnswer: 'We use the past participle with perfect tenses (e.g., have seen, had eaten) and in passive voice constructions (e.g., the letter was written).',
        promptInstructions: 'Explica al docente al menos dos situaciones donde se usa el participio pasado.',
        explanation: 'El participio nunca actúa solo como verbo de acción en pasado simple; requiere un auxiliar o forma pasiva.',
        category: 'Grammar',
        points: 200
      },
      {
        id: 'sv6',
        type: 'example',
        question: "Give an example sentence applying the past simple of 'freeze' ('froze') describing cold weather.",
        options: [],
        correctAnswer: 'The river froze completely during the blizzard.',
        modelAnswer: 'Last winter, the pipes in our garden froze because of the frost.',
        promptInstructions: 'Di o escribe una oración de ejemplo en voz alta usando "froze".',
        explanation: 'Freeze -> Froze -> Frozen. "Froze" es la forma correcta para una acción completada en el pasado.',
        category: 'Grammar',
        points: 400
      }
    ]
  },
  {
    id: 'default_roulette_travel',
    pin: 'SPIN24',
    title: '🎡 Vegas Airport & Travel Roulette',
    description: 'Spin the roulette wheel to test your travel English! Airport announcements, hotel check-ins, and ordering.',
    level: 'B1 - B2',
    category: 'Travel & Communication',
    gameType: 'roulette',
    createdAt: Date.now() - 86400000 * 2,
    questions: [
      {
        id: 'tr1',
        type: 'multiple_choice',
        question: "At the airport counter, what document confirms your seat and gate number?",
        options: ['Boarding pass', 'Passport cover', 'Luggage tag', 'Flight brochure'],
        correctAnswer: 'Boarding pass',
        promptInstructions: 'Selecciona la opción correcta.',
        explanation: "A 'boarding pass' is the official document that allows a passenger to board an airplane.",
        category: 'Vocabulary',
        points: 200
      },
      {
        id: 'tr2',
        type: 'example',
        question: "Pretend you are dining in a restaurant. Politely ask the waiter for the check and a glass of water.",
        options: [],
        correctAnswer: 'Excuse me, could we please have the check and a glass of water?',
        modelAnswer: 'Could you bring us the bill and some water, please?',
        promptInstructions: 'Pide la cuenta y agua de forma educada en inglés.',
        explanation: 'Usar "Could we please have..." o "May I have..." demuestra cortesía y naturalidad en el inglés de hospitalidad.',
        category: 'Speaking',
        points: 250
      },
      {
        id: 'tr3',
        type: 'concept',
        question: "Explain the difference between a 'direct flight' and a 'connecting flight with a layover'.",
        options: [],
        correctAnswer: 'A direct flight has no plane changes; a connecting flight requires changing planes during a layover.',
        modelAnswer: 'A direct flight takes you straight to your destination without changing planes, while a connecting flight requires you to stop at an intermediate airport (layover) and switch aircraft.',
        promptInstructions: 'Explica en voz alta la diferencia entre vuelo directo y vuelo con escala.',
        explanation: 'En la industria de viajes, un layover o escala implica desembarcar y esperar el siguiente vuelo de conexión.',
        category: 'Vocabulary',
        points: 300
      },
      {
        id: 'tr4',
        type: 'multiple_choice',
        question: "Choose the correct preposition: 'The flight arrives _____ Terminal 3 at 5:00 PM.'",
        options: ['At', 'In', 'On', 'To'],
        correctAnswer: 'At',
        promptInstructions: 'Selecciona la opción correcta.',
        explanation: "We use 'at' for specific points/locations within a facility (e.g. 'at Terminal 3', 'at Gate 12').",
        category: 'Grammar',
        points: 350
      },
      {
        id: 'tr5',
        type: 'example',
        question: "Imagine your hotel room is too cold. Formulate a polite sentence asking the receptionist for an extra blanket.",
        options: [],
        correctAnswer: 'Hello, could I please request an extra blanket for room 305?',
        modelAnswer: 'Good evening, it is quite cold in our room. Could you send an extra blanket up, please?',
        promptInstructions: 'Formula en inglés una petición educada para recepción de hotel.',
        explanation: 'Las fórmulas de cortesía como "Could I please get..." son las más recomendadas al viajar.',
        category: 'Speaking',
        points: 300
      },
      {
        id: 'tr6',
        type: 'concept',
        question: "What does it mean when an airline announces that a passenger is 'traveling on standby'?",
        options: [],
        correctAnswer: 'The passenger does not have a confirmed seat and waits to see if an empty seat becomes available.',
        modelAnswer: 'Traveling on standby means you do not have a guaranteed seat reservation, but wait at the gate to see if any seats remain open before departure.',
        promptInstructions: 'Explica al docente qué significa viajar "on standby" en un aeropuerto.',
        explanation: '"Standby" es el término utilizado cuando un viajero queda en lista de espera ante asientos no ocupados.',
        category: 'Pronunciation & Vocabulary',
        points: 400
      }
    ]
  },
  {
    id: 'default_blackjack_idioms',
    pin: 'CARD21',
    title: '🃏 21 Blackjack: Idioms & Expressions',
    description: 'Hit or Stand against the Dealer! Answer idioms and business English questions to draw winning cards.',
    level: 'B2 - C1',
    category: 'Idioms & Advanced',
    gameType: 'blackjack',
    createdAt: Date.now() - 86400000,
    questions: [
      {
        id: 'bj1',
        type: 'multiple_choice',
        question: "What does the idiom 'to hit the jackpot' mean?",
        options: ['To have great or sudden success', 'To lose all your money', 'To break an electronic device', 'To play games all night'],
        correctAnswer: 'To have great or sudden success',
        promptInstructions: 'Selecciona la opción correcta.',
        explanation: "'To hit the jackpot' originally comes from slot machines and means to gain sudden great fortune or success.",
        category: 'Idioms',
        points: 250
      },
      {
        id: 'bj2',
        type: 'concept',
        question: "Explain the meaning and social purpose of the idiom 'to break the ice' in a group or meeting.",
        options: [],
        correctAnswer: 'To do or say something that relieves tension and makes strangers comfortable talking.',
        modelAnswer: 'To "break the ice" means to ease social awkwardness or tension among people meeting for the first time, helping conversation flow naturally.',
        promptInstructions: 'Explica el significado del modismo "break the ice" en voz alta al docente.',
        explanation: 'Viene de los barcos rompehielos que abrían paso; figurativamente abre el camino a una conversación distendida.',
        category: 'Idioms',
        points: 200
      },
      {
        id: 'bj3',
        type: 'example',
        question: "Create a sentence using the expression 'call it a day' in a context where coworkers finish a demanding project.",
        options: [],
        correctAnswer: 'We finished the final draft, so let\'s call it a day and celebrate tomorrow.',
        modelAnswer: 'We have resolved all the bugs; let\'s call it a day and get some rest.',
        promptInstructions: 'Crea una oración de ejemplo aplicando "call it a day".',
        explanation: '"Call it a day" significa dar por terminada la jornada de trabajo o estudio por hoy.',
        category: 'Idioms',
        points: 300
      },
      {
        id: 'bj4',
        type: 'multiple_choice',
        question: "Which phrasal verb means 'to cancel an event'?",
        options: ['Call off', 'Call on', 'Call up', 'Call in'],
        correctAnswer: 'Call off',
        promptInstructions: 'Selecciona la opción correcta.',
        explanation: "'Call off' means to cancel something that was scheduled (e.g. 'They called off the game due to rain').",
        category: 'Grammar',
        points: 350
      },
      {
        id: 'bj5',
        type: 'concept',
        question: "Explain the difference between 'literal language' and 'idiomatic (figurative) language'. Give a quick example.",
        options: [],
        correctAnswer: 'Literal language means exact words; idiomatic language has a figurative cultural meaning.',
        modelAnswer: 'Literal language describes exact reality (e.g. "it is raining heavily"), whereas idiomatic language uses cultural metaphors whose meanings cannot be deduced literally (e.g. "it is raining cats and dogs").',
        promptInstructions: 'Explica al docente la diferencia entre sentido literal y modismo/figurado.',
        explanation: 'Los modismos nunca se traducen palabra por palabra porque su significado es cultural.',
        category: 'Idioms',
        points: 250
      },
      {
        id: 'bj6',
        type: 'example',
        question: "Use the idiom 'cost an arm and a leg' in an example sentence complaining about the price of a flight or device.",
        options: [],
        correctAnswer: 'That new smartphone costs an arm and a leg!',
        modelAnswer: 'Flying first-class during peak season costs an arm and a leg.',
        promptInstructions: 'Di o escribe una oración de ejemplo aplicando "cost an arm and a leg".',
        explanation: 'Expresión informal muy común para describir algo exageradamente costoso.',
        category: 'Idioms',
        points: 400
      }
    ]
  }
];
