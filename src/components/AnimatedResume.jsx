import React, { useMemo } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { renderInlineMarkdown } from '../utils/customResumeBuilder';
import '../styles/animatedResume.css';

/* ── Tuning ────────────────────────────────────────────────────────────── */
const EASE = [0.22, 1, 0.36, 1];
const DUR  = 0.45;

const WORD_TRANSITION    = { duration: DUR,        ease: EASE };
const BULLET_TRANSITION  = { duration: DUR * 1.05, ease: EASE };
const LAYOUT_TRANSITION  = { duration: DUR * 1.15, ease: EASE };

/* ── Word-level crossfade ──────────────────────────────────────────────────
 * Splits a string into word + whitespace tokens. Each non-whitespace word is
 * its own motion.span keyed by `${index}:${word}` — when the new text shares
 * a word at the same position, the key matches and that span just smoothly
 * reflows (no fade). Words that don't match fade out/in with a tiny blur.
 * ───────────────────────────────────────────────────────────────────────── */
const tokenizeWords = (text = '') => text.split(/(\s+)/).filter(Boolean);

const MorphText = ({ text, className, as: Tag = 'span' }) => {
  const tokens = useMemo(() => tokenizeWords(text ?? ''), [text]);

  return (
    <Tag className={className}>
      <AnimatePresence mode="popLayout" initial={false}>
        {tokens.map((tok, i) => {
          if (/^\s+$/.test(tok)) {
            return <span key={`ws-${i}-${tok.length}`}>{tok}</span>;
          }
          const key = `${i}:${tok}`;
          return (
            <motion.span
              key={key}
              layout="position"
              className="morph-word"
              initial={{ opacity: 0, y: -6, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{    opacity: 0, y: 6, filter: 'blur(4px)' }}
              transition={WORD_TRANSITION}
            >
              {tok}
            </motion.span>
          );
        })}
      </AnimatePresence>
    </Tag>
  );
};

/* ── Animated bullet list ──────────────────────────────────────────────────
 * Each <li> is keyed by its full text. Identical bullets across variants stay
 * put (no animation). Different bullets fade + slide while the list height
 * smoothly reflows.
 * ───────────────────────────────────────────────────────────────────────── */
const AnimatedBullets = ({ bullets = [] }) => (
  <motion.ul layout className="bullets" transition={LAYOUT_TRANSITION}>
    <AnimatePresence mode="popLayout" initial={false}>
      {bullets.map((bullet, i) => (
        <motion.li
          layout
          key={bullet}
          className="morph-bullet"
          initial={{ opacity: 0, y: -8, filter: 'blur(3px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{    opacity: 0, y: 8, filter: 'blur(3px)' }}
          transition={{ ...BULLET_TRANSITION, delay: i * 0.012 }}
          dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(bullet) }}
        />
      ))}
    </AnimatePresence>
  </motion.ul>
);

/* ── Section wrapper ────────────────────────────────────────────────────── */
const Section = ({ label, children }) => (
  <motion.div layout className="section" transition={LAYOUT_TRANSITION}>
    <div className="section-header">
      <div className="section-label">{label}</div>
      <div className="section-rule"></div>
    </div>
    {children}
  </motion.div>
);

/* ── Experience entry ───────────────────────────────────────────────────── */
const ExperienceItem = ({ experience }) => (
  <motion.div
    layout
    className="exp-item"
    initial={{ opacity: 0, y: -6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{    opacity: 0, y: 6 }}
    transition={LAYOUT_TRANSITION}
  >
    <div className="exp-role-row">
      <MorphText className="exp-role" text={experience.role} as="div" />
      <MorphText className="exp-date" text={experience.date} as="div" />
    </div>
    <div className="exp-header">
      <MorphText className="exp-company" text={experience.company || experience.role} as="div" />
      <MorphText className="exp-stack"   text={experience.stack} as="div" />
    </div>
    <motion.div layout className="experience" transition={LAYOUT_TRANSITION}>
      <AnimatedBullets bullets={experience.bullets} />
    </motion.div>
  </motion.div>
);

/* ── Project entry ──────────────────────────────────────────────────────── */
const ProjectItem = ({ project }) => (
  <motion.div
    layout
    className="proj-item"
    initial={{ opacity: 0, y: -6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{    opacity: 0, y: 6 }}
    transition={LAYOUT_TRANSITION}
  >
    <div className="proj-header">
      <MorphText className="proj-name" text={project.name} as="div" />
      {project.link
        ? (
            <a href={project.link} className="proj-link" target="_blank" rel="noopener noreferrer">
              {project.link.replace(/^https?:\/\//, '')} ↗
            </a>
          )
        : <div />}
      <MorphText className="proj-tech" text={project.tech} as="div" />
    </div>
    <AnimatedBullets bullets={project.bullets} />
  </motion.div>
);

/* ── Static contact block (identical across all variants) ──────────────── */
const ContactBlock = () => (
  <div className="contact-block">
    <span className="contact-social">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6.62 10.79a15.46 15.46 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.85 21 3 13.15 3 3c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.24.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
      </svg>+1 (571) 418-1458
    </span>
    <a href="mailto:aakarshika93@gmail.com" className="contact-social">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
      </svg>aakarshika93@gmail.com
    </a>
    <div className="two-col">
      <a href="https://github.com/aakarshika" className="contact-social" target="_blank" rel="noopener noreferrer">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.44 9.82 8.21 11.41.6.11.79-.26.79-.58 0-.29-.01-1.05-.02-2.06-3.34.73-4.04-1.61-4.04-1.61-.55-1.38-1.34-1.75-1.34-1.75-1.09-.75.08-.74.08-.74 1.2.08 1.83 1.23 1.83 1.23 1.07 1.83 2.8 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.39 1.23-3.23-.12-.3-.53-1.52.12-3.17 0 0 1.01-.32 3.3 1.23.96-.27 1.98-.4 3-.4s2.04.14 3 .4c2.29-1.55 3.29-1.23 3.29-1.23.65 1.65.24 2.87.12 3.17.77.84 1.23 1.92 1.23 3.23 0 4.62-2.8 5.65-5.48 5.95.43.37.82 1.1.82 2.22 0 1.6-.01 2.89-.01 3.28 0 .32.19.7.8.58C20.57 21.82 24 17.31 24 12c0-6.63-5.37-12-12-12z" />
        </svg>/aakarshika
      </a>
      <a href="https://linkedin.com/in/aakarshika" className="contact-social" target="_blank" rel="noopener noreferrer">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.03-1.85-3.03-1.86 0-2.14 1.45-2.14 2.94v5.66H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.62 0 4.29 2.38 4.29 5.48v6.26zM5.34 7.43a2.07 2.07 0 110-4.14 2.07 2.07 0 010 4.14zM7.12 20.45H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0z" />
        </svg>/aakarshikap
      </a>
    </div>
    <a href="https://aakarshika.com" className="contact-social" target="_blank" rel="noopener noreferrer">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm6.93 9h-3.06a15.7 15.7 0 00-1.38-5.03A8.03 8.03 0 0118.93 11zM12 4.04c.84 1.16 1.79 3.12 2.17 6.96H9.83c.38-3.84 1.33-5.8 2.17-6.96zM4.07 13h3.06c.13 1.81.6 3.51 1.38 5.03A8.03 8.03 0 014.07 13zm3.06-2H4.07a8.03 8.03 0 014.44-5.03A15.7 15.7 0 007.13 11zm1.99 2h5.76c-.14 1.95-.64 3.69-1.34 4.96-.56 1.03-1.14 1.73-1.54 2.08-.4-.35-.98-1.05-1.54-2.08-.7-1.27-1.2-3.01-1.34-4.96zm6.75 5.03c.78-1.52 1.25-3.22 1.38-5.03h3.06a8.03 8.03 0 01-4.44 5.03z" />
      </svg>aakarshika.com
    </a>
  </div>
);

/* ── Root ───────────────────────────────────────────────────────────────── */
const AnimatedResume = ({ bundle }) => {
  if (!bundle) return null;

  const {
    titleTag,
    summary,
    experiences = [],
    projects = [],
    skillGroups = [],
    education = [],
    additional = [],
  } = bundle;

  const leftProjects  = projects.filter((_, i) => i % 2 === 0);
  const rightProjects = projects.filter((_, i) => i % 2 === 1);

  return (
    <LayoutGroup>
      <motion.div layout className="animated-resume-root" transition={LAYOUT_TRANSITION}>

        {/* ── PAGE 1 ──────────────────────────────────────────────────── */}
        <motion.div layout className="page" transition={LAYOUT_TRANSITION}>
          <div className="corner-accent" />

          <div className="header">
            <div className="name-block">
              <div className="name">Aakarshika<span> Priydarshi</span></div>
              <MorphText className="title-tag" text={titleTag} as="div" />
            </div>
            <ContactBlock />
          </div>

          <MorphText className="tagline" text={summary} as="div" />

          <Section label="Experience">
            <AnimatePresence mode="popLayout" initial={false}>
              {experiences.map((exp) => (
                <ExperienceItem
                  key={`${exp.role}__${exp.company}`}
                  experience={exp}
                />
              ))}
            </AnimatePresence>
          </Section>

          <Section label="Skills">
            <motion.div layout className="skills-grid" transition={LAYOUT_TRANSITION}>
              <AnimatePresence mode="popLayout" initial={false}>
                {skillGroups.map((group) => (
                  <motion.div
                    layout
                    key={group.label}
                    className="skill-group"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{    opacity: 0, y: 6 }}
                    transition={LAYOUT_TRANSITION}
                  >
                    <div className="skill-label">{group.label}</div>
                    <MorphText
                      className="skill-value"
                      text={group.values.join(', ')}
                      as="div"
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </Section>

          <div className="page-num">01 / 02</div>
        </motion.div>

        {/* ── PAGE 2 ──────────────────────────────────────────────────── */}
        <motion.div layout className="page" transition={LAYOUT_TRANSITION}>
          <div className="corner-accent" />

          <div className="page-mini-header">
            <div className="page-mini-title">
              Aakarshika Priydarshi <span>— Projects</span>
            </div>
            <div className="page-mini-contact">aakarshika93@gmail.com</div>
          </div>

          <Section label="Projects">
            <div className="two-col">
              <div>
                <AnimatePresence mode="popLayout" initial={false}>
                  {leftProjects.map((p, i) => (
                    <React.Fragment key={`L:${p.name}`}>
                      <ProjectItem project={p} />
                      {i < leftProjects.length - 1 && (
                        <motion.div layout className="divider-thin" transition={LAYOUT_TRANSITION} />
                      )}
                    </React.Fragment>
                  ))}
                </AnimatePresence>
              </div>
              <div>
                <AnimatePresence mode="popLayout" initial={false}>
                  {rightProjects.map((p, i) => (
                    <React.Fragment key={`R:${p.name}`}>
                      <ProjectItem project={p} />
                      {i < rightProjects.length - 1 && (
                        <motion.div layout className="divider-thin" transition={LAYOUT_TRANSITION} />
                      )}
                    </React.Fragment>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </Section>

          <Section label="Education">
            <div className="two-col">
              {education.map((edu, i) => (
                <motion.div
                  layout
                  key={`${edu.degree}-${i}`}
                  className="edu-item"
                  transition={LAYOUT_TRANSITION}
                >
                  <div>
                    <div className="edu-degree">{edu.degree}</div>
                    <div className="edu-school">{edu.school}</div>
                  </div>
                  <div className="edu-date">{edu.date}</div>
                </motion.div>
              ))}
            </div>
          </Section>

          <motion.div layout className="section additional-section" transition={LAYOUT_TRANSITION}>
            <div className="section-header">
              <div className="section-label">Additional</div>
              <div className="section-rule"></div>
            </div>
            <div className="additional-grid">
              {additional.map((entry, i) => (
                <motion.div layout key={`${entry.label}-${i}`} transition={LAYOUT_TRANSITION}>
                  <div className="skill-label">{entry.label}</div>
                  <div className="skill-value">{entry.value}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <div className="page-num">02 / 02</div>
        </motion.div>
      </motion.div>
    </LayoutGroup>
  );
};

export default AnimatedResume;
