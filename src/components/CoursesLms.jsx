import React, { useState, useEffect } from 'react';
import { BookOpen, PlayCircle, CheckCircle2, Lock, ArrowLeft, RefreshCw, Layers, Clock, Award, ShieldAlert, Sparkles, Check } from 'lucide-react';

export default function CoursesLms({ token }) {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseDetails, setCourseDetails] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentQuiz, setCurrentQuiz] = useState(null); // Added for selected quiz
  const [quizAnswers, setQuizAnswers] = useState({}); // Stores answers for the active quiz
  const [quizResult, setQuizResult] = useState(null); // Stores result after submission
  const [completedLessons, setCompletedLessons] = useState([]);
  const [isActiveUser, setIsActiveUser] = useState(true);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [certificateData, setCertificateData] = useState(null);
  const [userCycle, setUserCycle] = useState(null);

  // Carregar catálogo de cursos
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const [coursesRes, cyclesRes] = await Promise.all([
        fetch('/api/courses', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/user/cycles', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (!coursesRes.ok) throw new Error('Falha ao carregar catálogo de cursos.');
      const data = await coursesRes.json();
      const cyclesData = cyclesRes.ok ? await cyclesRes.json() : {};
      setCourses(data.courses || []);
      if (cyclesData.current_cycle) setUserCycle(cyclesData.current_cycle);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [token]);

  // Carregar detalhes do curso e quizzes
  const handleSelectCourse = async (courseId) => {
    setDetailsLoading(true);
    setSelectedCourse(courseId);
    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Falha ao carregar aulas do curso.');
      const data = await res.json();

      setCourseDetails(data.course);
      setCompletedLessons(data.completed_lessons || []);
      setIsActiveUser(data.is_active_user);

      // Reset states
      setCurrentLesson(null);
      setCurrentQuiz(null);
      setQuizResult(null);

      // Selecionar primeira aula por padrão
      if (data.course.modules && data.course.modules.length > 0) {
        const firstMod = data.course.modules[0];
        if (firstMod.lessons && firstMod.lessons.length > 0) {
          setCurrentLesson(firstMod.lessons[0]);
        }
      }
    } catch (err) {
      alert(err.message);
      setSelectedCourse(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleQuizSubmit = async (quizId) => {
    try {
      const res = await fetch(`/api/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ answers: quizAnswers })
      });
      if (!res.ok) throw new Error('Erro ao submeter quiz.');
      const data = await res.json();
      setQuizResult(data.attempt);
    } catch (err) {
      alert(err.message);
    }
  };

  // Marcar/Desmarcar aula como concluída
  const handleToggleComplete = async (lessonId) => {
    try {
      const res = await fetch(`/api/user/lessons/${lessonId}/complete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Erro ao salvar conclusão.');

      const data = await res.json();
      if (data.completed) {
        setCompletedLessons(prev => [...prev, lessonId]);
      } else {
        setCompletedLessons(prev => prev.filter(id => id !== lessonId));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleGenerateCertificate = async (courseId) => {
    try {
      const res = await fetch(`/api/user/courses/${courseId}/certificate`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Erro ao gerar certificado.');
      const data = await res.json();
      setCertificateData(data.certificate);
      setShowCertificateModal(true);
    } catch (err) {
      alert(err.message);
    }
  };


  // Helper para formatar URL de Vídeo (YouTube embed ou HTML5)
  const renderVideoPlayer = (url) => {
    if (!url) return null;

    let embedUrl = url;
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }

    if (embedUrl.includes('youtube.com/embed') || embedUrl.includes('vimeo.com')) {
      return (
        <iframe
          src={embedUrl}
          title="Vídeo-aula"
          style={{ width: '100%', height: '100%', border: 'none', borderRadius: '12px' }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }

    return (
      <video
        src={url}
        controls
        controlsList="nodownload"
        style={{ width: '100%', height: '100%', borderRadius: '12px', background: '#000' }}
      />
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
        <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 1rem', display: 'block' }} />
        Carregando Área de Membros (LMS)...
      </div>
    );
  }

  // --- VISÃO 1: CATÁLOGO DE CURSOS ---
  if (!selectedCourse || !courseDetails) {
    return (
      <div>
        <div className="card-header" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <BookOpen size={26} style={{ color: 'var(--accent-cyan)' }} />
              Área de Membros & Cursos LMS
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
              Treinamentos exclusivos para capacitação de afiliados e líderes da Matriz Epi 3x3
            </p>
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <BookOpen size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <h3>Nenhum curso disponível no momento.</h3>
            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
              Novos treinamentos e vídeo-aulas serão adicionados em breve pelo administrador!
            </p>
          </div>
        ) : (
          <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(59,130,246,0.1)', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Award size={20} style={{ color: '#60a5fa' }} />
            <span style={{ fontSize: '0.9rem', color: '#93c5fd' }}>
              Seu ciclo atual: <strong>{userCycle?.display_name || 'Bronze'}</strong> — Acesse cursos do seu nível ou superior.
            </span>
          </div>
        )}
        {!loading && courses.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {courses.map((course) => {
              const requiredCycleOrder = course.cycle_id || 1;
              const userCycleOrder = userCycle?.order_index || 1;
              const isAccessible = userCycleOrder >= requiredCycleOrder;
              return (
                <div
                  key={course.id}
                  className="glass-card"
                  style={{
                    padding: 0,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    border: `1px solid ${isAccessible ? 'var(--border-color)' : 'rgba(244,63,94,0.3)'}`,
                    transition: 'transform 0.2s, border-color 0.2s',
                    opacity: isAccessible ? 1 : 0.7
                  }}
                >
                  <div style={{ position: 'relative', height: '170px', background: '#1e293b' }}>
                    <img
                      src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop'}
                      alt={course.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute', top: '10px', right: '10px',
                      background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(4px)',
                      padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8'
                    }}>
                      {course.modules_count || 0} Módulos • {course.lessons_count || 0} Aulas
                    </div>
                    {!isAccessible && (
                      <div style={{
                        position: 'absolute', top: '10px', left: '10px',
                        background: 'rgba(244,63,94,0.85)', backdropFilter: 'blur(4px)',
                        padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, color: '#fff',
                        display: 'flex', alignItems: 'center', gap: '0.3rem'
                      }}>
                        <Lock size={12} /> Requer ciclo superior
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ color: '#fff', fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                      {course.title}
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.4', marginBottom: '1.25rem', flex: 1 }}>
                      {course.description || 'Sem descrição.'}
                    </p>

                    <button
                      type="button"
                      className="btn-submit"
                      style={{
                        marginTop: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        opacity: isAccessible ? 1 : 0.5,
                        cursor: isAccessible ? 'pointer' : 'not-allowed'
                      }}
                      onClick={() => isAccessible && handleSelectCourse(course.id)}
                      disabled={!isAccessible}
                    >
                      {isAccessible ? <><PlayCircle size={18} /> Acessar Curso</> : <><Lock size={18} /> Ciclo Insuficiente</>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // --- VISÃO 2: PLAYER E NAVEGAÇÃO DE AULAS DO CURSO ---

  // Calcular progresso do aluno no curso
  let totalLessonsInCourse = 0;
  courseDetails.modules?.forEach(m => {
    totalLessonsInCourse += m.lessons?.length || 0;
  });
  const completedInCourseCount = courseDetails.modules?.flatMap(m => m.lessons || []).filter(l => completedLessons.includes(l.id)).length || 0;
  const progressPercent = totalLessonsInCourse > 0 ? Math.round((completedInCourseCount / totalLessonsInCourse) * 100) : 0;

  return (
    <div>
      {/* BOTÃO VOLTAR E CABEÇALHO DO CURSO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <button
          type="button"
          className="nav-btn nav-btn-outline"
          onClick={() => { setSelectedCourse(null); setCourseDetails(null); }}
          style={{ cursor: 'pointer', gap: '0.4rem' }}
        >
          <ArrowLeft size={16} /> Voltar aos Cursos
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {progressPercent === 100 && (
            <button
              type="button"
              className="nav-btn nav-btn-primary"
              style={{ cursor: 'pointer', background: 'var(--accent-cyan)', color: '#0f172a', fontWeight: 700 }}
              onClick={() => handleGenerateCertificate(selectedCourse)}
            >
              <Award size={16} /> Gerar Certificado
            </button>
          )}
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Progresso do Curso: <strong>{completedInCourseCount} / {totalLessonsInCourse} concluidas</strong> ({progressPercent}%)
          </div>
          <div style={{ width: '120px', height: '8px', background: '#334155', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--accent-emerald)', transition: 'width 0.3s' }}></div>
          </div>
        </div>
      </div>

      {detailsLoading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 1rem', display: 'block' }} />
          Carregando conteúdo do curso...
        </div>
      ) : (
        <div>
          {/* TELA DE BLOQUEIO SE O AFILIADO ESTIVER INATIVO */}
          {!isActiveUser ? (
            <div className="glass-card" style={{
              textAlign: 'center', padding: '3.5rem 1.5rem',
              border: '1px solid rgba(244, 63, 94, 0.4)',
              background: 'linear-gradient(135deg, rgba(30, 27, 46, 0.95), rgba(15, 23, 42, 0.95))'
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(244, 63, 94, 0.2)', color: '#f43f5e',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.25rem'
              }}>
                <Lock size={32} />
              </div>

              <h2 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 800 }}>
                ⚠️ Conteúdo Exclusivo para Membros Ativos
              </h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: '580px', margin: '0.75rem auto 1.75rem', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Sua conta está no momento com o status <strong>INATIVO</strong> (adesão ou mensalidade pendente).
                Regularize sua ativação no painel para ter acesso ilimitado a todas as vídeo-aulas, treinamentos e materiais de apoio do sistema EPI!
              </p>

              <div className="sponsor-badge sponsor-badge-invalid" style={{ display: 'inline-flex', marginBottom: 0 }}>
                <ShieldAlert size={18} />
                <span>Bloqueio temporário de segurança LMS</span>
              </div>
            </div>
          ) : (
            /* CONTEÚDO LIBERADO PARA AFILIADO ATIVO */
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '1.5rem' }} className="lms-layout">
              {/* AREA DO PLAYER DE VÍDEO E DETALHES DA AULA OU QUIZ */}
              <div>
                {currentLesson ? (
                  <div>
                    <div style={{
                      position: 'relative', width: '100%', paddingTop: '56.25%',
                      background: '#000', borderRadius: '12px', overflow: 'hidden',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)', border: '1px solid var(--border-color)'
                    }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                        {renderVideoPlayer(currentLesson.video_url)}
                      </div>
                    </div>

                    <div className="glass-card" style={{ marginTop: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.85rem' }}>
                        <div>
                          <h2 style={{ color: '#fff', fontSize: '1.35rem', fontWeight: 800 }}>
                            {currentLesson.title}
                          </h2>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                            <Clock size={13} /> Duração: {currentLesson.duration || '10:00'}
                          </span>
                        </div>

                        <button
                          type="button"
                          className={`nav-btn ${completedLessons.includes(currentLesson.id) ? 'nav-btn-primary' : 'nav-btn-outline'}`}
                          style={{
                            background: completedLessons.includes(currentLesson.id) ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
                            color: completedLessons.includes(currentLesson.id) ? '#34d399' : '#fff',
                            borderColor: completedLessons.includes(currentLesson.id) ? 'rgba(16, 185, 129, 0.5)' : 'var(--border-color)',
                            cursor: 'pointer', gap: '0.4rem'
                          }}
                          onClick={() => handleToggleComplete(currentLesson.id)}
                        >
                          <CheckCircle2 size={16} />
                          {completedLessons.includes(currentLesson.id) ? 'Aula Concluída ✓' : 'Marcar como Concluída'}
                        </button>
                      </div>

                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                        {currentLesson.description || 'Sem descrição cadastrada para esta aula.'}
                      </p>
                    </div>
                  </div>
                ) : currentQuiz ? (
                  <div className="glass-card">
                    <h2 style={{ color: '#fff' }}>Quiz: {currentQuiz.title}</h2>
                    {quizResult ? (
                      <div>
                        <h3>Resultado: {quizResult.score.toFixed(1)}%</h3>
                        <p>{quizResult.passed ? 'Parabéns, você foi aprovado!' : 'Infelizmente você não atingiu a pontuação mínima. Tente novamente.'}</p>
                      </div>
                    ) : (
                      currentQuiz.questions.map((q, idx) => (
                      <div key={q.id} style={{ marginBottom: '1.5rem' }}>
                        <p style={{ color: '#fff', fontWeight: 600 }}>{idx + 1}. {q.question_text}</p>
                        {q.quiz_options.map((opt, optIdx) => (
                          <button
                            key={optIdx}
                            onClick={() => setQuizAnswers({ ...quizAnswers, [q.id]: optIdx })}
                            style={{
                              display: 'block', margin: '0.5rem 0', width: '100%',
                              background: quizAnswers[q.id] === optIdx
                                  ? (quizResult
                                      ? (optIdx === q.correct_option_index ? '#10b981' : '#f43f5e')
                                      : '#38bdf8')
                                  : (quizResult && optIdx === q.correct_option_index ? '#10b981' : '#1e293b'),
                              color: '#fff', padding: '0.8rem', borderRadius: '8px', border: 'none', cursor: quizResult ? 'default' : 'pointer',
                              textAlign: 'left', fontWeight: quizAnswers[q.id] === optIdx ? 600 : 400
                            }}
                            disabled={!!quizResult}
                          >
                            {opt.option_text}
                            {quizResult && optIdx === q.correct_option_index && <span style={{ float: 'right' }}>✅</span>}
                            {quizResult && quizAnswers[q.id] === optIdx && optIdx !== q.correct_option_index && <span style={{ float: 'right' }}>❌</span>}
                          </button>
                        ))}
                      </div>
                    ))
                    )}
                    {!quizResult && (
                      <button className="btn-submit" onClick={() => handleQuizSubmit(currentQuiz.id)}>Enviar Respostas</button>
                    )}
                  </div>
                ) : (
                  <div className="glass-card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Selecione uma aula ou quiz no menu lateral.
                  </div>
                )}
              </div>

              {/* MENU LATERAL DE MÓDULOS E AULAS (ACCORDION / LISTA) */}
              <div>
                <div className="glass-card" style={{ padding: '1.25rem' }}>
                  <h3 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Layers size={18} style={{ color: 'var(--accent-cyan)' }} />
                    Módulos do Curso
                  </h3>

                  {(!courseDetails.modules || courseDetails.modules.length === 0) ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1.5rem 0' }}>
                      Nenhum módulo cadastrado neste curso.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {courseDetails.modules.map((mod) => (
                        <div key={mod.id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                          <h4 style={{ color: '#67e8f9', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {mod.title}
                          </h4>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            {mod.lessons?.map((lesson) => {
                              const isCurrent = currentLesson && currentLesson.id === lesson.id;
                              const isCompleted = completedLessons.includes(lesson.id);

                              return (
                                <button
                                  key={lesson.id}
                                  type="button"
                                  onClick={() => { setCurrentLesson(lesson); setCurrentQuiz(null); }}
                                  style={{
                                    /* ... (estilo existente) ... */
                                  }}
                                >
                                  {/* ... (conteúdo existente) ... */}
                                </button>
                              );
                            })}
                            {mod.quizzes?.map((quiz) => (
                              <button
                                key={quiz.id}
                                type="button"
                                onClick={() => { setCurrentQuiz(quiz); setCurrentLesson(null); setQuizAnswers({}); setQuizResult(null); }}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                                  padding: '0.6rem 0.75rem', borderRadius: '8px', width: '100%', textAlign: 'left',
                                  background: (currentQuiz && currentQuiz.id === quiz.id) ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.03)',
                                  color: (currentQuiz && currentQuiz.id === quiz.id) ? '#fbbf24' : 'var(--text-muted)',
                                  border: `1px solid ${(currentQuiz && currentQuiz.id === quiz.id) ? '#fbbf24' : 'transparent'}`,
                                  cursor: 'pointer', transition: 'all 0.15s'
                                }}
                              >
                                <Award size={15} />
                                <span style={{ fontSize: '0.82rem', fontWeight: (currentQuiz && currentQuiz.id === quiz.id) ? 700 : 500 }}>
                                  Quiz: {quiz.title}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {showCertificateModal && certificateData && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem'
        }}>
          <div className="glass-card" style={{ maxWidth: '600px', width: '100%', border: '2px solid var(--accent-cyan)', background: '#0f172a', textAlign: 'center', padding: '2rem' }}>
            <Award size={48} style={{ color: 'var(--accent-cyan)', margin: '0 auto 1rem' }} />
            <h2 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800 }}>Certificado de Conclusão</h2>
            <p>Certificamos que</p>
            <h3 style={{ color: 'var(--accent-cyan)', fontSize: '1.4rem' }}>{certificateData.student_name}</h3>
            <p>concluiu o curso</p>
            <h4 style={{ color: '#fff', fontSize: '1.2rem' }}>{certificateData.course_title}</h4>
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Data: {certificateData.date}</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Hash: {certificateData.verifiable_hash}</p>
            <button className="nav-btn nav-btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => setShowCertificateModal(false)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}
