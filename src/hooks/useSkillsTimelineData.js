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

// Comprehensive skill category paths based on skills in skills_timeline.json
export const skillCategoryPaths = [
  // Backend Technologies
  'tech.backend.python',
  'tech.backend.python.django',
  'tech.backend.python.django_rest_framework',
  'tech.backend.python.pytest',
  'tech.backend.python.machine_learning',
  'tech.backend.python.computer_vision',
  'tech.backend.python.nlp',
  
  // Frontend Technologies
  'tech.frontend.angularjs',
  'tech.frontend.reactjs',
  
  // Databases
  'tech.database.mysql',
  'tech.database.mongodb',
  'tech.database.redshift',
  
  // DevOps & CI/CD
  'tech.devops.jenkins',
  'tech.devops.aws',
  'tech.devops.localstack',
  
  // Data Engineering
  'tech.data.apache_kafka',
  'tech.data.airflow',
  'tech.data.apache_spark',
  
  // Software Engineering
  'tech.software_engineering',
  
  // Education
  'education.teaching',
];

// Helper: Build a category tree from flat paths
function buildCategoryTree(paths) {
  const root = {};
  for (const path of paths) {
    const parts = path.split('.');
    let node = root;
    for (const part of parts) {
      node[part] = node[part] || {};
      node = node[part];
    }
  }
  return root;
}

// Helper: Get all nodes at a given category level
function getNodesAtLevel(tree, level, prefix = '', result = []) {
  for (const key in tree) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (level === 1) {
      result.push(path);
    } else {
      getNodesAtLevel(tree[key], level - 1, path, result);
    }
  }
  return result;
}

// Helper: Get all leaf skill paths
function getAllSkillPaths(tree, prefix = '', result = []) {
  let isLeaf = true;
  for (const key in tree) {
    isLeaf = false;
    getAllSkillPaths(tree[key], prefix ? `${prefix}.${key}` : key, result);
  }
  if (isLeaf && prefix) result.push(prefix);
  return result;
}

// Helper: Map skill names to category paths
function mapSkillToCategoryPath(skill) {
  const skillMapping = {
    'Python': 'tech.backend.python',
    'Django': 'tech.backend.python.django',
    'Django REST Framework': 'tech.backend.python.django_rest_framework',
    'Pytest': 'tech.backend.python.pytest',
    'Machine Learning': 'tech.backend.python.machine_learning',
    'Computer Vision': 'tech.backend.python.computer_vision',
    'NLP': 'tech.backend.python.nlp',
    'ReactJS': 'tech.frontend.reactjs',
    'AngularJS': 'tech.frontend.angularjs',
    'MySQL': 'tech.database.mysql',
    'MongoDB': 'tech.database.mongodb',
    'Redshift': 'tech.database.redshift',
    'Jenkins': 'tech.devops.jenkins',
    'AWS': 'tech.devops.aws',
    'Localstack': 'tech.devops.localstack',
    'Apache Kafka': 'tech.data.apache_kafka',
    'Airflow': 'tech.data.airflow',
    'Apache Spark': 'tech.data.apache_spark',
    'Software Engineering': 'tech.software_engineering',
    'Teaching': 'education.teaching',
  };
  
  return skillMapping[skill] || `tech.other.${skill.toLowerCase().replace(/\s+/g, '_')}`;
}

export default function useSkillsTimelineData({ yZoom = 600, categoryLevel = null } = {}) {
  return useMemo(() => {
    // Build category tree
    const categoryTree = buildCategoryTree(skillCategoryPaths);
    
    // Determine visible nodes (skills or categories)
    let visibleNodes;
    if (categoryLevel && categoryLevel > 0) {
      visibleNodes = getNodesAtLevel(categoryTree, categoryLevel);
    } else {
      visibleNodes = getAllSkillPaths(categoryTree);
    }
    
    // Map skills to their category paths
    const skillToPaths = {};
    const uniqueSkills = getUniqueSkills(skillsData);
    uniqueSkills.forEach(skill => {
      skillToPaths[skill] = [mapSkillToCategoryPath(skill)];
    });
    
    // Map visible nodes to skills
    const pathToSkill = {};
    for (const skill in skillToPaths) {
      for (const path of skillToPaths[skill]) {
        pathToSkill[path] = pathToSkill[path] || [];
        pathToSkill[path].push(skill);
      }
    }
    
    // For each visible node, aggregate data
    const nodeToSkills = {};
    visibleNodes.forEach(node => {
      if (pathToSkill[node]) {
        nodeToSkills[node] = pathToSkill[node];
      } else {
        // If it's a category, aggregate all descendant skills
        nodeToSkills[node] = [];
        for (const skill in skillToPaths) {
          if (skillToPaths[skill].some(path => path.startsWith(node))) {
            nodeToSkills[node].push(skill);
          }
        }
      }
    });
    
    // Generate color palette for visible nodes (skills or categories)
    const palette = generateColorPalette(visibleNodes.length);
    const nodeColors = {};
    visibleNodes.forEach((node, i) => { nodeColors[node] = palette[i]; });
    
    // Prepare skill positions (for X axis)
    const nodePositions = {};
    visibleNodes.forEach((node, i) => { nodePositions[node] = i; });
    
    // Sort data for time calculations
    const sortedData = [...skillsData].sort((a, b) => parseDate(a['Start Date']) - parseDate(b['Start Date']));
    const startTime = parseDate(sortedData[0]['Start Date']);
    const endTime = parseDate(sortedData[sortedData.length - 1]['End Date']);
    const timeRange = endTime - startTime;
    
    // Calculate segments, gaps, achievements
    const segments = [];
    const gaps = [];
    const achievements = [];
    
    visibleNodes.forEach(node => {
      const nodeSkills = nodeToSkills[node];
      
      // Gather all periods for this node (skill or category)
      let periods = [];
      nodeSkills.forEach(skill => {
        periods = periods.concat(skillsData.filter(item => item.Skill === skill));
      });
      
      // Sort periods by start date
      periods.sort((a, b) => parseDate(a['Start Date']) - parseDate(b['Start Date']));
      
      // If this is a category, merge overlapping periods
      if (nodeSkills.length > 1) {
        // Merge periods by time overlap (simple union)
        const merged = [];
        periods.forEach(period => {
          const s = parseDate(period['Start Date']);
          const e = parseDate(period['End Date']);
          if (!merged.length || s > merged[merged.length - 1].end) {
            merged.push({ start: s, end: e, expertise: period['Expertise Level Achieved'] });
          } else {
            merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, e);
          }
        });
        
        // Create a segment for each merged period
        merged.forEach(({ start, end, expertise }) => {
          const y1 = ((start - startTime) / timeRange) * (yZoom - 40) + 20;
          const y2 = ((end - startTime) / timeRange) * (yZoom - 40) + 20;
          segments.push({
            x: nodePositions[node],
            y1,
            y2,
            thickness: expertiseThickness[expertise] || 20,
            color: nodeColors[node],
            skill: node,
            company: '',
            description: '',
            expertise
          });
        });
      } else {
        // For a single skill, use original logic
        for (let i = 0; i < periods.length; i++) {
          const item = periods[i];
          const x = nodePositions[node];
          const y1 = ((parseDate(item['Start Date']) - startTime) / timeRange) * (yZoom - 40) + 20;
          const y2 = ((parseDate(item['End Date']) - startTime) / timeRange) * (yZoom - 40) + 20;
          segments.push({
            x,
            y1,
            y2,
            thickness: expertiseThickness[item['Expertise Level Achieved']],
            color: nodeColors[node],
            skill: item.Skill,
            company: item['Where Tag'],
            description: item['1 line Description on how I used it'],
            expertise: item['Expertise Level Achieved']
          });
          
          if (item['Expertise Level Achieved'] === 'Expert') {
            achievements.push({
              x,
              y: y2,
              skill: item.Skill,
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
      }
    });
    
    return {
      segments,
      gaps,
      achievements,
      skills: visibleNodes,
      startTime,
      endTime,
      skillColors: nodeColors,
      expertiseThickness,
      skillPositions: nodePositions,
      parseDate
    };
  }, [yZoom, categoryLevel]);
} 