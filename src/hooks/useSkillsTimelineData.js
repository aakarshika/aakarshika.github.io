import { useMemo } from 'react';
import skillsData from '../../skills_timeline.json';


// Color mapping for different skills (generate a color for each skill)
function generateColorPalette(n) {
  // Generates n visually distinct HSL colors
  return Array.from({ length: n }, (_, i) => `hsl(${Math.round((360 * i) / n)}, 70%, 55%)`);
}

// Expertise level mapping to line thickness
const expertiseThickness = {
  'Beginner': 20,
  'Intermediate': 40,
  'Expert': 60
};

const parseDate = (dateStr) => new Date(dateStr).getTime();
const getUniqueSkills = (data) => [...new Set(data.map(item => item.Skill))];
const getUniqueCompanies = (data) => [...new Set(data.map(item => item['Where Tag']))];

export default function useSkillsTimelineData({ yZoom = 600 } = {}) {
  return useMemo(() => {
    const skills = getUniqueSkills(skillsData);
    const companies = getUniqueCompanies(skillsData);
    // Generate a color for each skill
    const palette = generateColorPalette(skills.length);
    const skillColors = {};
    skills.forEach((skill, i) => { skillColors[skill] = palette[i]; });
    const sortedData = [...skillsData].sort((a, b) => parseDate(a['Start Date']) - parseDate(b['Start Date']));
    const startTime = parseDate(sortedData[0]['Start Date']);
    const endTime = parseDate(sortedData[sortedData.length - 1]['End Date']);
    const timeRange = endTime - startTime;
    const skillPositions = {};
    skills.forEach((skill, i) => { skillPositions[skill] = i; });
    const skillPeriods = {};
    skills.forEach(skill => { skillPeriods[skill] = []; });
    sortedData.forEach(item => { skillPeriods[item.Skill].push(item); });
    const segments = [];
    const gaps = [];
    const achievements = [];
    skills.forEach(skill => {
      const periods = skillPeriods[skill];
      for (let i = 0; i < periods.length; i++) {
        const item = periods[i];
        const x = skillPositions[skill];
        const y1 = ((parseDate(item['Start Date']) - startTime) / timeRange) * (yZoom - 40) + 20;
        const y2 = ((parseDate(item['End Date']) - startTime) / timeRange) * (yZoom - 40) + 20;
        segments.push({
          x,
          y1,
          y2,
          thickness: expertiseThickness[item['Expertise Level Achieved']],
          color: skillColors[skill], // Use skill color
          skill,
          company: item['Where Tag'],
          description: item['1 line Description on how I used it'],
          expertise: item['Expertise Level Achieved']
        });
        if (item['Expertise Level Achieved'] === 'Expert') {
          achievements.push({
            x,
            y: y2,
            skill,
            company: item['Where Tag'],
            expertise: item['Expertise Level Achieved']
          });
        }
        if (i < periods.length - 1) {
          const next = periods[i + 1];
          const gapStart = parseDate(item['End Date']);
          const gapEnd = parseDate(next['Start Date']);
          if (gapEnd > gapStart) {
            const gy1 = ((gapStart - startTime) / timeRange) * (yZoom - 40) + 20;
            const gy2 = ((gapEnd - startTime) / timeRange) * (yZoom - 40) + 20;
            gaps.push({
              x,
              y1: gy1,
              y2: gy2
            });
          }
        }
      }
    });
    return {
      segments,
      gaps,
      achievements,
      skills,
      companies,
      startTime,
      endTime,
      skillColors, // Return skillColors instead of companyColors
      expertiseThickness,
      skillPositions,
      skillPeriods,
      parseDate
    };
  }, [yZoom]);
}

// Sample category tree for skills
// Each skill should be a leaf node under its category
export const skillCategoryTree = {
  Tech: {
    Frontend: ['React', 'Vue', 'HTML', 'CSS', 'JavaScript'],
    Backend: ['Node.js', 'Express', 'Python', 'Java'],
    Database: ['MongoDB', 'PostgreSQL', 'MySQL'],
    DevOps: ['Docker', 'Kubernetes', 'AWS']
  },
  Sports: {
    Team: ['Football', 'Basketball', 'Cricket'],
    Individual: ['Tennis', 'Chess', 'Running']
  },
  Communication: {
    Languages: ['English', 'Spanish', 'French'],
    SoftSkills: ['Public Speaking', 'Negotiation', 'Writing']
  },
  Design: {
    UI: ['Figma', 'Sketch'],
    UX: ['User Research', 'Wireframing']
  }
}; 