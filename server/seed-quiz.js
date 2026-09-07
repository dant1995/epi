const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://chjqjxlkiqiuuwunyrup.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoanFqeGxraXFpdXV3dW55cnVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyMDE2MTEsImV4cCI6MjEwMzc3NzYxMX0.bEul-DJ-3KDuFn0Hn8BLFHo6YI52d-p_mYTv80aorfY';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const questions = [
  {
    question_text: 'Qual é o tamanho da matriz forçada no sistema EPI?',
    correct_option_index: 1,
    options: ['2x2', '3x3', '4x4', '5x5']
  },
  {
    question_text: 'Quantos ciclos progressivos existem no sistema?',
    correct_option_index: 2,
    options: ['3', '4', '5', '6']
  },
  {
    question_text: 'Qual é o primeiro ciclo progressivo?',
    correct_option_index: 0,
    options: ['Bronze', 'Prata', 'Ouro', 'Platino']
  },
  {
    question_text: 'Qual é o valor do ciclo Socio Bronze?',
    correct_option_index: 1,
    options: ['$50', '$80', '$100', '$200']
  },
  {
    question_text: 'Como são alocados os novos membros na árvore?',
    correct_option_index: 2,
    options: ['Aleatório', 'Por ordem de registro', 'Algoritmo BFS (largura)', 'Manual pelo admin']
  }
];

async function seedQuizQuestions() {
  console.log('🔍 Buscando quizzes existentes...');

  const { data: quizzes, error } = await supabase
    .from('quizzes')
    .select('id, title');

  if (error) {
    console.error('❌ Erro ao buscar quizzes:', error.message);
    return;
  }

  if (!quizzes || quizzes.length === 0) {
    console.log('⚠️ Nenhum quiz encontrado. Crie um quiz no painel admin primeiro.');
    return;
  }

  console.log(`📋 Encontrados ${quizzes.length} quiz(z):`);
  quizzes.forEach(q => console.log(`   - ID: ${q.id} | ${q.title}`));

  for (const quiz of quizzes) {
    console.log(`\n📝 Adicionando perguntas ao quiz "${quiz.title}" (ID: ${quiz.id})...`);

    for (const q of questions) {
      const { data: question, error: qError } = await supabase
        .from('questions')
        .insert([{ quiz_id: quiz.id, question_text: q.question_text, correct_option_index: q.correct_option_index }])
        .select()
        .single();

      if (qError) {
        console.error(`   ❌ Erro ao criar pergunta: ${qError.message}`);
        continue;
      }

      const optionsToInsert = q.options.map(opt => ({ question_id: question.id, option_text: opt }));
      const { error: optError } = await supabase
        .from('quiz_options')
        .insert(optionsToInsert);

      if (optError) {
        console.error(`   ❌ Erro ao criar opções: ${optError.message}`);
      } else {
        console.log(`   ✅ Pergunta "${q.question_text.substring(0, 40)}..." adicionada`);
      }
    }
  }

  console.log('\n🎉 Seed de perguntas concluído!');
}

seedQuizQuestions();
