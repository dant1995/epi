import React, { useState, useEffect } from 'react';
import { BookOpen, PlayCircle, CheckCircle2, Lock, ArrowLeft, RefreshCw, Layers, Clock, Award, ShieldAlert, Sparkles, Check } from 'lucide-react';

export default function CoursesLms({ token, currentUser }) {
  const user = currentUser || (() => {
    try { return JSON.parse(localStorage.getItem('unilevel_user')); } catch { return null; }
  })();
  const isAdmin = user?.role === 'admin';

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

  // Cargar catálogo de cursos
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const [coursesRes, cyclesRes] = await Promise.all([
        fetch('/api/courses', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/user/cycles', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (!coursesRes.ok) throw new Error('Error al cargar catálogo de cursos.');
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

  // Cargar detalles del curso y quizzes
  const handleSelectCourse = async (courseId) => {
    if (!isAdmin) {
      alert('Acceso restringido: Los cursos están temporalmente bloqueados por el administrador.');
      return;
    }
    setDetailsLoading(true);
    setSelectedCourse(courseId);
    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al cargar las clases del curso.');
      const data = await res.json();

      setCourseDetails(data.course);
      setCompletedLessons(data.completed_lessons || []);
      setIsActiveUser(data.is_active_user);

      // Reset states
      setCurrentLesson(null);
      setCurrentQuiz(null);
      setQuizResult(null);

      // Seleccionar primera clase por defecto
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
      if (!res.ok) throw new Error('Error al enviar quiz.');
      const data = await res.json();
      setQuizResult(data.attempt);
    } catch (err) {
      alert(err.message);
    }
  };

  // Marcar/Desmarcar clase como completada
  const handleToggleComplete = async (lessonId) => {
    try {
      const res = await fetch(`/api/user/lessons/${lessonId}/complete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al guardar progreso.');

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
      if (!res.ok) throw new Error('Error al generar certificado.');
      const data = await res.json();
      setCertificateData(data.certificate);
      setShowCertificateModal(true);
    } catch (err) {
      alert(err.message);
    }
  };


  // Helper para formatear URL de Video (YouTube embed o HTML5)
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
          title="Video-clase"
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
        Cargando Área de Miembros (LMS)...
      </div>
    );
  }

  // --- VISIÓN 1: CATÁLOGO DE CURSOS ---
  if (!selectedCourse || !courseDetails) {
    return (
      <div>
        <div className="card-header" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <BookOpen size={26} style={{ color: 'var(--accent-cyan)' }} />
              Área de Miembros & Cursos LMS
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
              Capacitaciones exclusivas para formación de afiliados y líderes de la Matriz Epi 3x3
            </p>
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <BookOpen size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <h3>Ningún curso disponible en este momento.</h3>
            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
              Nuevas capacitaciones y video-clases serán añadidas pronto por el administrador!
            </p>
          </div>
        ) : (
          !isAdmin ? (
            <div style={{ marginBottom: '1.25rem', padding: '0.85rem 1.25rem', background: 'rgba(239, 68, 68, 0.12)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.35)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShieldAlert size={24} style={{ color: '#ef4444', flexShrink: 0 }} />
              <div>
                <div style={{ color: '#fca5a5', fontWeight: 700, fontSize: '0.95rem' }}>
                  Contenido en Mantenimiento / Acceso Restringido
                </div>
                <div style={{ color: '#f87171', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                  El acceso a los cursos se encuentra bloqueado temporalmente por la administración.
                </div>
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: 'rgba(16, 185, 129, 0.12)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.35)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Sparkles size={20} style={{ color: '#10b981', flexShrink: 0 }} />
              <span style={{ fontSize: '0.88rem', color: '#6ee7b7' }}>
                <strong>Modo Administrador:</strong> Tienes acceso total habilitado para gestionar y previsualizar los cursos.
              </span>
            </div>
          )
        )}
        {!loading && courses.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {courses.map((course) => {
              const requiredCycleOrder = course.cycle_id || 1;
              const userCycleOrder = userCycle?.order_index || 1;
              const hasCycleAccess = userCycleOrder >= requiredCycleOrder;
              const isAccessible = isAdmin; // Por ahora, solo el admin puede acceder
              const isBlocked = !isAdmin;

              return (
                <div
                  key={course.id}
                  className="glass-card"
                  style={{
                    padding: 0,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    border: `1px solid ${isAccessible ? 'var(--border-color)' : 'rgba(239, 68, 68, 0.4)'}`,
                    transition: 'transform 0.2s, border-color 0.2s',
                    opacity: isAccessible ? 1 : 0.85
                  }}
                >
                  <div style={{ position: 'relative', height: '170px', background: '#1e293b' }}>
                    <img
                      src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop'}
                      alt={course.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        filter: isBlocked ? 'brightness(0.65)' : 'none'
                      }}
                    />
                    <div style={{
                      position: 'absolute', top: '10px', right: '10px',
                      background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(4px)',
                      padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8'
                    }}>
                      {course.modules_count || 0} Módulos • {course.lessons_count || 0} Clases
                    </div>
                    {isBlocked && (
                      <div style={{
                        position: 'absolute', top: '10px', left: '10px',
                        background: 'rgba(239, 68, 68, 0.9)', backdropFilter: 'blur(4px)',
                        padding: '0.35rem 0.7rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#fff',
                        display: 'flex', alignItems: 'center', gap: '0.35rem', boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                      }}>
                        <Lock size={14} /> Bloqueado (Solo Admin)
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ color: '#fff', fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                      {course.title}
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.4', marginBottom: '1.25rem', flex: 1 }}>
                      {course.description || 'Sin descripción.'}
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
                        opacity: isAccessible ? 1 : 0.65,
                        cursor: isAccessible ? 'pointer' : 'not-allowed',
                        background: isAccessible ? 'var(--accent-purple, #6366f1)' : 'rgba(239, 68, 68, 0.15)',
                        border: isAccessible ? 'none' : '1px solid rgba(239, 68, 68, 0.4)',
                        color: isAccessible ? '#fff' : '#fca5a5'
                      }}
                      onClick={() => isAccessible && handleSelectCourse(course.id)}
                      disabled={!isAccessible}
                    >
                      {isAccessible ? (
                        <><PlayCircle size={18} /> Acceder al Curso</>
                      ) : (
                        <><Lock size={18} /> Acceso Bloqueado (Solo Admin)</>
                      )}
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

  // --- VISIÓN 2: REPRODUCTOR Y NAVEGACIÓN DE CLASES DEL CURSO ---

  // Calcular progreso del alumno en el curso
  let totalLessonsInCourse = 0;
  courseDetails.modules?.forEach(m => {
    totalLessonsInCourse += m.lessons?.length || 0;
  });
  const completedInCourseCount = courseDetails.modules?.flatMap(m => m.lessons || []).filter(l => completedLessons.includes(l.id)).length || 0;
  const progressPercent = totalLessonsInCourse > 0 ? Math.round((completedInCourseCount / totalLessonsInCourse) * 100) : 0;

  return (
    <div>
      {/* BOTÓN VOLVER Y ENCABEZADO DEL CURSO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <button
          type="button"
          className="nav-btn nav-btn-outline"
          onClick={() => { setSelectedCourse(null); setCourseDetails(null); }}
          style={{ cursor: 'pointer', gap: '0.4rem' }}
        >
          <ArrowLeft size={16} /> Volver a los Cursos
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {progressPercent === 100 && (
            <button
              type="button"
              className="nav-btn nav-btn-primary"
              style={{ cursor: 'pointer', background: 'var(--accent-cyan)', color: '#0f172a', fontWeight: 700 }}
              onClick={() => handleGenerateCertificate(selectedCourse)}
            >
              <Award size={16} /> Generar Certificado
            </button>
          )}
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Progreso del Curso: <strong>{completedInCourseCount} / {totalLessonsInCourse} completadas</strong> ({progressPercent}%)
          </div>
          <div style={{ width: '120px', height: '8px', background: '#334155', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--accent-emerald)', transition: 'width 0.3s' }}></div>
          </div>
        </div>
      </div>

      {detailsLoading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 1rem', display: 'block' }} />
          Cargando contenido del curso...
        </div>
      ) : (
        <div>
          {/* PANTALLA DE BLOQUEO SI EL AFILIADO ESTÁ INACTIVO */}
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
                ⚠️ Contenido Exclusivo para Miembros Activos
              </h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: '580px', margin: '0.75rem auto 1.75rem', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Su cuenta está actualmente con el estado <strong>INACTIVO</strong> (afiliación o cuota pendiente).
                Regularice su activación en el panel para tener acceso ilimitado a todas las video-clases, capacitaciones y materiales de apoyo del sistema EPI!
              </p>

              <div className="sponsor-badge sponsor-badge-invalid" style={{ display: 'inline-flex', marginBottom: 0 }}>
                <ShieldAlert size={18} />
                <span>Bloqueo temporal de seguridad LMS</span>
              </div>
            </div>
          ) : (
            /* CONTENIDO LIBERADO PARA AFILIADO ACTIVO */
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '1.5rem' }} className="lms-layout">
              {/* ÁREA DEL REPRODUCTOR DE VIDEO Y DETALLES DE LA CLASE O QUIZ */}
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
                            <Clock size={13} /> Duración: {currentLesson.duration || '10:00'}
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
                          {completedLessons.includes(currentLesson.id) ? 'Clase Completada ✓' : 'Marcar como Completada'}
                        </button>
                      </div>

                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                        {currentLesson.description || 'Sin descripción registrada para esta clase.'}
                      </p>
                    </div>
                  </div>
                ) : currentQuiz ? (
                  <div className="glass-card">
                    <h2 style={{ color: '#fff' }}>Quiz: {currentQuiz.title}</h2>
                    {quizResult ? (
                      <div>
                        <h3>Resultado: {quizResult.score.toFixed(1)}%</h3>
                        <p>{quizResult.passed ? '¡Felicitaciones, usted ha aprobado!' : 'Lamentablemente no alcanzó la puntuación mínima. Intente de nuevo.'}</p>
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
                      <button className="btn-submit" onClick={() => handleQuizSubmit(currentQuiz.id)}>Enviar Respuestas</button>
                    )}
                  </div>
                ) : (
                  <div className="glass-card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Seleccione una clase o quiz en el menú lateral.
                  </div>
                )}
              </div>

              {/* MENÚ LATERAL DE MÓDULOS Y CLASES (ACCORDION / LISTA) */}
              <div>
                <div className="glass-card" style={{ padding: '1.25rem' }}>
                  <h3 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Layers size={18} style={{ color: 'var(--accent-cyan)' }} />
                    Módulos del Curso
                  </h3>

                  {(!courseDetails.modules || courseDetails.modules.length === 0) ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1.5rem 0' }}>
                      Ningún módulo registrado en este curso.
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
                                   {/* ... (contenido existente) ... */}
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
            <h2 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800 }}>Certificado de Finalización</h2>
            <p>Certificamos que</p>
            <h3 style={{ color: 'var(--accent-cyan)', fontSize: '1.4rem' }}>{certificateData.student_name}</h3>
            <p>finalizó el curso</p>
            <h4 style={{ color: '#fff', fontSize: '1.2rem' }}>{certificateData.course_title}</h4>
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Fecha: {certificateData.date}</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Hash: {certificateData.verifiable_hash}</p>
            <button className="nav-btn nav-btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => setShowCertificateModal(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}
