const FILE_NAME_REGEX = /^aakarshika-(.+)-(exp|projects|skills)\.md$/;

const escapeHtml = (value = '') =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const renderInlineMarkdown = (value = '') => {
  const escaped = escapeHtml(value);
  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<span class="inline-code">$1</span>');
};

const splitSections = (content = '') =>
  content
    .split(/\n---\n/g)
    .map((section) => section.trim())
    .filter(Boolean);

const stripMarker = (line = '') => line.replace(/^[#*\s-]+/, '').trim();

const parseBullets = (blockLines) =>
  blockLines
    .map((line) => line.trim())
    .filter((line) => /^-\s+/.test(line))
    .map((line) => line.replace(/^-\s+/, '').trim())
    .filter(Boolean);

const parseExperienceEntry = (section) => {
  const lines = section.split('\n').map((line) => line.trimEnd());
  const headingLine = lines.find((line) => line.trim().startsWith('### '));
  if (!headingLine) {
    return null;
  }

  const heading = headingLine.replace(/^###\s+/, '').trim();
  const [rolePart, companyPart = ''] = heading.split(/\s+—\s+/, 2);
  const dateLine = lines.find((line) => /^\*.+\*$/.test(line.trim()));
  const stackLine = lines.find((line) => /^\*Stack:/i.test(line.trim()));
  const bullets = parseBullets(lines);

  return {
    role: rolePart.trim(),
    company: companyPart.trim(),
    date: stripMarker(dateLine ?? ''),
    stack: stripMarker((stackLine ?? '').replace(/^Stack:/i, '')).replace(/^:\s*/, ''),
    bullets,
  };
};

const parseProjectEntry = (section) => {
  const lines = section.split('\n').map((line) => line.trimEnd());
  const headingLine = lines.find((line) => line.trim().startsWith('### '));
  if (!headingLine) {
    return null;
  }

  const heading = headingLine.replace(/^###\s+/, '').trim();
  const [namePart, linkPart] = heading.split(/\s+—\s+/, 2);
  const techLine = lines.find((line) => /^\*.+\*$/.test(line.trim()));
  const bullets = parseBullets(lines);

  return {
    name: namePart.trim(),
    link: linkPart && /^https?:\/\//.test(linkPart.trim()) ? linkPart.trim() : '',
    tech: stripMarker(techLine ?? ''),
    bullets,
  };
};

const parseExperienceMarkdown = (expMarkdown) => {
  const lines = expMarkdown.split('\n');
  const headlineLine = lines.find((line) => /^\*\*.+\*\*$/.test(line.trim()));
  const summaryStart = headlineLine ? lines.indexOf(headlineLine) + 1 : 0;
  const summaryEnd = lines.findIndex((line, index) => index > summaryStart && line.trim() === '---');
  const summary = lines
    .slice(summaryStart, summaryEnd === -1 ? undefined : summaryEnd)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  const experienceSections = splitSections(expMarkdown).filter((section) => /(^|\n)###\s+/.test(section));
  const experiences = experienceSections.map(parseExperienceEntry).filter(Boolean);

  return {
    titleTag: stripMarker(headlineLine ?? ''),
    summary,
    experiences,
  };
};

const parseProjectsMarkdown = (projectsMarkdown) => {
  const projectSections = splitSections(projectsMarkdown).filter((section) => /(^|\n)###\s+/.test(section));
  return projectSections.map(parseProjectEntry).filter(Boolean);
};

const splitStackTokens = (value = '') =>
  value
    .split(/·|,|\//g)
    .map((token) => token.trim())
    .filter(Boolean);

const parseMarkdownSkillsSection = (markdown = '') => {
  const lines = markdown.split('\n').map((line) => line.trim());
  const groups = [];
  let currentGroup = null;

  lines.forEach((line) => {
    if (!line) return;

    const headingMatch = line.match(/^\*\*(.+?)\*\*$/);
    if (headingMatch) {
      if (currentGroup && currentGroup.values.length) {
        groups.push(currentGroup);
      }
      currentGroup = {
        label: headingMatch[1].trim(),
        values: [],
      };
      return;
    }

    if (!currentGroup) return;
    const cleanedLine = line.replace(/^-+\s*/, '').trim();
    if (!cleanedLine) return;

    currentGroup.values.push(
      ...cleanedLine
        .split(',')
        .map((token) => token.trim())
        .filter(Boolean)
    );
  });

  if (currentGroup && currentGroup.values.length) {
    groups.push(currentGroup);
  }

  return groups;
};

const buildSkills = (experiences, projects) => {
  const experienceSkills = new Set();
  const projectSkills = new Set();

  experiences.forEach((experience) => {
    splitStackTokens(experience.stack).forEach((token) => experienceSkills.add(token));
  });

  projects.forEach((project) => {
    splitStackTokens(project.tech).forEach((token) => projectSkills.add(token));
  });

  const allSkills = Array.from(new Set([...experienceSkills, ...projectSkills]));
  const generalSkills = allSkills.filter((token) => !experienceSkills.has(token) || !projectSkills.has(token));

  return {
    experienceSkills: Array.from(experienceSkills),
    projectSkills: Array.from(projectSkills),
    generalSkills,
  };
};

const buildExperienceMarkup = (experiences) =>
  experiences
    .map(
      (experience) => `
      <div class="exp-item">
        <div class="exp-role-row">
          <div class="exp-role">${renderInlineMarkdown(experience.role)}</div>
          <div class="exp-date">${renderInlineMarkdown(experience.date)}</div>
        </div>
        <div class="exp-header">
          <div class="exp-company">${renderInlineMarkdown(experience.company || experience.role)}</div>
          <div class="exp-stack">${renderInlineMarkdown(experience.stack)}</div>
        </div>
        <div class="experience">
          <ul class="bullets">
            ${experience.bullets.map((bullet) => `<li>${renderInlineMarkdown(bullet)}</li>`).join('')}
          </ul>
        </div>
      </div>
    `
    )
    .join('');

const buildProjectsMarkup = (projects) =>
  projects
    .map(
      (project) => `
      <div class="proj-item">
        <div class="proj-header">
          <div class="proj-name">${renderInlineMarkdown(project.name)}</div>
          ${project.link ? `<a href="${escapeHtml(project.link)}" class="proj-link">${escapeHtml(project.link.replace(/^https?:\/\//, ''))} ↗</a>` : '<div></div>'}
          <div class="proj-tech">${renderInlineMarkdown(project.tech)}</div>
        </div>
        <ul class="bullets">
          ${project.bullets.map((bullet) => `<li>${renderInlineMarkdown(bullet)}</li>`).join('')}
        </ul>
      </div>
      <div class="divider-thin"></div>
    `
    )
    .join('');

const buildSkillsMarkup = (skills) =>
  (skills.explicitGroups ?? [])
    .map(
      (group) => `
      <div class="skill-group">
        <div class="skill-label">${group.label}</div>
        <div class="skill-value">${escapeHtml(group.values.join(', '))}</div>
      </div>
    `
    )
    .join('');

const getSectionByLabel = (root, label) => {
  const sections = Array.from(root?.querySelectorAll('.section') ?? []);
  return (
    sections.find((section) => {
      const sectionLabel = section.querySelector(':scope > .section-header .section-label');
      return sectionLabel?.textContent?.trim().toLowerCase() === label.toLowerCase();
    }) ?? null
  );
};

const cleanText = (value = '') => value.replace(/\s+/g, ' ').trim();

const parseEducation = (doc) => {
  const educationSection = getSectionByLabel(doc.querySelectorAll('.page')[0], 'Education');
  if (!educationSection) {
    return [];
  }

  return Array.from(educationSection.querySelectorAll('.edu-item'))
    .map((item) => ({
      degree: cleanText(item.querySelector('.edu-degree')?.textContent ?? ''),
      school: cleanText(item.querySelector('.edu-school')?.textContent ?? ''),
      date: cleanText(item.querySelector('.edu-date')?.textContent ?? ''),
    }))
    .filter((entry) => entry.degree || entry.school || entry.date);
};

const parseAdditionalSections = (doc) => {
  const additionalSection = getSectionByLabel(doc.querySelectorAll('.page')[1], 'Additional');
  if (!additionalSection) {
    return [];
  }

  return Array.from(additionalSection.querySelectorAll('.additional-grid > div'))
    .map((item) => ({
      label: cleanText(item.querySelector('.skill-label')?.textContent ?? ''),
      value: cleanText(item.querySelector('.skill-value')?.textContent ?? ''),
    }))
    .filter((entry) => entry.label && entry.value);
};

const parseBaseResumeMeta = (doc) => ({
  name: cleanText(doc.querySelector('.name')?.textContent ?? 'Aakarshika Priydarshi'),
  titleTag: cleanText(doc.querySelector('.title-tag')?.textContent ?? ''),
  tagline: cleanText(doc.querySelector('.tagline')?.textContent ?? ''),
  contacts: Array.from(doc.querySelectorAll('.contact-block a, .contact-block span'))
    .map((node) => cleanText(node.textContent ?? ''))
    .filter(Boolean),
});

const buildExperienceMarkdown = (experiences = []) =>
  experiences
    .map((experience) => {
      const parts = [`### ${experience.role}${experience.company ? ` — ${experience.company}` : ''}`];
      if (experience.date) {
        parts.push(`*${experience.date}*`);
      }
      if (experience.stack) {
        parts.push(`*Stack: ${experience.stack}*`);
      }
      if (experience.bullets?.length) {
        parts.push('', ...experience.bullets.map((bullet) => `- ${bullet}`));
      }
      return parts.join('\n');
    })
    .join('\n\n---\n\n');

const buildProjectsMarkdown = (projects = []) =>
  projects
    .map((project) => {
      const heading = project.link ? `### ${project.name} — ${project.link}` : `### ${project.name}`;
      const parts = [heading];
      if (project.tech) {
        parts.push(`*${project.tech}*`);
      }
      if (project.bullets?.length) {
        parts.push('', ...project.bullets.map((bullet) => `- ${bullet}`));
      }
      return parts.join('\n');
    })
    .join('\n\n---\n\n');

const buildSkillsMarkdown = (skills = []) =>
  skills
    .map((group) => `**${group.label}**\n${group.values.join(', ')}`)
    .join('\n\n');

const buildEducationMarkdown = (education = []) =>
  education
    .map((item) => {
      const lines = [`- **${item.degree}**${item.date ? ` (${item.date})` : ''}`];
      if (item.school) {
        lines.push(`  - ${item.school}`);
      }
      return lines.join('\n');
    })
    .join('\n');

const buildAdditionalMarkdown = (entries = []) => entries.map((entry) => `- **${entry.label}:** ${entry.value}`).join('\n');

export const getResumeTypeMap = (markdownByPath) => {
  const typeMap = {};

  Object.entries(markdownByPath).forEach(([path, content]) => {
    if (!content) return;
    const fileName = path.split('/').pop() ?? '';
    const match = fileName.match(FILE_NAME_REGEX);
    if (!match) return;

    const [, type, fileRole] = match;
    if (!typeMap[type]) {
      typeMap[type] = {};
    }
    typeMap[type][fileRole] = content;
  });

  return typeMap;
};

export const getAvailableResumeTypes = (typeMap) =>
  Object.entries(typeMap)
    .filter(([, files]) => files.exp && files.projects && files.skills)
    .map(([type]) => type)
    .sort();

export const buildCustomResumeHtml = ({ baseHtml, expMarkdown, projectsMarkdown, skillsMarkdown }) => {
  if (!baseHtml || !expMarkdown || !projectsMarkdown || !skillsMarkdown) {
    return '';
  }

  const { titleTag, summary, experiences } = parseExperienceMarkdown(expMarkdown);
  const projects = parseProjectsMarkdown(projectsMarkdown);
  const explicitSkills = parseMarkdownSkillsSection(skillsMarkdown);
  const skills = {
    ...buildSkills(experiences, projects),
    explicitGroups: explicitSkills,
  };

  const parser = new DOMParser();
  const doc = parser.parseFromString(baseHtml, 'text/html');

  const titleTagNode = doc.querySelector('.title-tag');
  if (titleTagNode && titleTag) {
    titleTagNode.textContent = titleTag;
  }

  const taglineNode = doc.querySelector('.tagline');
  if (taglineNode && summary) {
    taglineNode.innerHTML = renderInlineMarkdown(summary);
  }

  const pages = doc.querySelectorAll('.page');
  const experienceSection = getSectionByLabel(pages[0], 'Experience');
  const skillsSection = getSectionByLabel(pages[0], 'Skills');
  const projectsSection = getSectionByLabel(pages[1], 'Projects');

  if (experienceSection) {
    experienceSection.innerHTML = `
      <div class="section-header">
        <div class="section-label">Experience</div>
        <div class="section-rule"></div>
      </div>
      ${buildExperienceMarkup(experiences)}
    `;
  }

  if (skillsSection) {
    skillsSection.innerHTML = `
      <div class="section-header">
        <div class="section-label">Skills</div>
        <div class="section-rule"></div>
      </div>
      <div class="skills-grid">
        ${buildSkillsMarkup(skills)}
      </div>
    `;
  }

  if (projectsSection) {
    projectsSection.innerHTML = `
      <div class="section-header">
        <div class="section-label">Projects</div>
        <div class="section-rule"></div>
      </div>
      <div class="two-col">
        <div>${buildProjectsMarkup(projects.filter((_, index) => index % 2 === 0))}</div>
        <div>${buildProjectsMarkup(projects.filter((_, index) => index % 2 === 1))}</div>
      </div>
    `;
  }

  return `<!DOCTYPE html>\n${doc.documentElement.outerHTML}`;
};

export const buildCustomResumeMarkdown = ({ baseHtml, expMarkdown, projectsMarkdown, skillsMarkdown }) => {
  if (!baseHtml || !expMarkdown || !projectsMarkdown || !skillsMarkdown) {
    return '';
  }

  const { titleTag, summary, experiences } = parseExperienceMarkdown(expMarkdown);
  const projects = parseProjectsMarkdown(projectsMarkdown);
  const explicitSkills = parseMarkdownSkillsSection(skillsMarkdown);

  const parser = new DOMParser();
  const doc = parser.parseFromString(baseHtml, 'text/html');
  const baseMeta = parseBaseResumeMeta(doc);
  const education = parseEducation(doc);
  const additional = parseAdditionalSections(doc);

  const sections = [
    `# ${baseMeta.name}`,
    titleTag || baseMeta.titleTag ? `_${titleTag || baseMeta.titleTag}_` : '',
    summary || baseMeta.tagline,
    baseMeta.contacts.length ? `## Contact\n${baseMeta.contacts.map((line) => `- ${line}`).join('\n')}` : '',
    experiences.length ? `## Experience\n${buildExperienceMarkdown(experiences)}` : '',
    projects.length ? `## Projects\n${buildProjectsMarkdown(projects)}` : '',
    explicitSkills.length ? `## Skills\n${buildSkillsMarkdown(explicitSkills)}` : '',
    education.length ? `## Education\n${buildEducationMarkdown(education)}` : '',
    additional.length ? `## Additional\n${buildAdditionalMarkdown(additional)}` : '',
  ].filter(Boolean);

  return `${sections.join('\n\n')}\n`;
};
